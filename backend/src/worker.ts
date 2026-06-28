import { Worker } from 'bullmq';
import { redisOptions } from './config/redis';
import { logger } from './config/logger';
import { prisma } from './config/db';
import { processEvaluationJob } from './services/evaluation.service';

logger.info('🤖 Starting evaluation worker process...');


// Initialize Worker
const worker = new Worker(
  'evaluation-queue',
  async (job) => {
    const { sessionId } = job.data;
    logger.info(`🤖 Worker processing job ${job.id} (Attempt ${job.attemptsMade + 1}) for session ${sessionId}`);

    // Update startedAt and retryCount on active processing attempt
    await prisma.evaluationJob.update({
      where: { interviewSessionId: sessionId },
      data: {
        startedAt: new Date(),
        retryCount: job.attemptsMade,
      },
    });

    try {
      await processEvaluationJob(sessionId);
      logger.info(`✅ Worker successfully completed job ${job.id}`);
    } catch (err: any) {
      logger.error(`💥 Worker failed processing job ${job.id} on attempt ${job.attemptsMade + 1}: ${err.message}`);
      
      const maxAttempts = job.opts.attempts || 3;
      if (job.attemptsMade + 1 >= maxAttempts) {
        logger.error(`❌ Job ${job.id} exceeded max attempts. Marking as FAILED in database.`);
        await prisma.$transaction([
          prisma.interviewSession.update({
            where: { id: sessionId },
            data: { evaluationStatus: 'FAILED' },
          }),
          prisma.evaluationJob.update({
            where: { interviewSessionId: sessionId },
            data: {
              status: 'FAILED',
              completedAt: new Date(),
              errorMessage: err.message || 'Worker processing failed after max attempts',
            },
          }),
        ]);
      } else {
        // Save intermediate error message
        await prisma.evaluationJob.update({
          where: { interviewSessionId: sessionId },
          data: {
            errorMessage: `Attempt ${job.attemptsMade + 1} failed: ${err.message}`,
          },
        });
      }
      
      // Re-throw to allow BullMQ to handle retry/exponential backoff
      throw err;
    }
  },
  {
    connection: redisOptions as any,
    concurrency: 1,
  }
);

worker.on('active', (job) => {
  logger.info(`🤖 Job ${job.id} has started processing`);
});

worker.on('completed', (job) => {
  logger.info(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  logger.error(`❌ Job ${job?.id} failed permanently: ${err.message}`);
});

worker.on('error', (err) => {
  logger.error(`⚠️ Worker error: ${err.message}`);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`🔌 Received ${signal}. Starting graceful shutdown...`);
  try {
    await worker.close();
    await prisma.$disconnect();
    logger.info('👋 Graceful shutdown complete. Exiting worker process.');
    process.exit(0);
  } catch (err: any) {
    logger.error(`💥 Error during graceful shutdown: ${err.message}`);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
