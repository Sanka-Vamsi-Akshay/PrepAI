import { Queue, QueueEvents } from 'bullmq';
import { redisConnection } from '../config/redis';
import { logger } from '../config/logger';

export const EVALUATION_QUEUE_NAME = 'evaluation-queue';

// Create BullMQ Queue and QueueEvents
export const evaluationQueue = new Queue(EVALUATION_QUEUE_NAME, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2500,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const evaluationEvents = new QueueEvents(EVALUATION_QUEUE_NAME, {
  connection: redisConnection as any,
});

export const enqueueEvaluationJob = async (sessionId: string) => {
  const jobId = `evaluation:${sessionId}`;

  try {
    // 1. Lookup existing job in queue to prevent duplicate entries
    const existingJob = await evaluationQueue.getJob(jobId);
    if (existingJob) {
      const state = await existingJob.getState();
      logger.info(`🤖 Job already exists in queue (state: "${state}") for session ${sessionId}. Skipping duplicate.`);
      return { job: existingJob, enqueued: false, state };
    }

    // 2. Add job with deterministic ID
    const job = await evaluationQueue.add(
      'evaluate-session',
      { sessionId },
      { jobId }
    );

    logger.info(`🤖 Enqueued evaluation job for session ${sessionId} with jobId: ${jobId}`);
    return { job, enqueued: true, state: 'enqueued' };
  } catch (error: any) {
    logger.error(`💥 Failed to interact with BullMQ evaluation queue: ${error.message}`);
    throw error;
  }
};
