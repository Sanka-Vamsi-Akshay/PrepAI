import { Router, Request, Response } from 'express';
import { prisma } from '@backend/config/db';
import { env } from '@backend/config/env';
import { logger } from '@backend/config/logger';
import { isRedisConnected } from '@backend/config/redis';
import { evaluationQueue } from '@backend/queues/evaluation.queue';
import { sendSuccessResponse, sendErrorResponse } from '@backend/utils/response';

const router = Router();

// 1. General Liveness Probe (Checks if process is running)
router.get('/live', (req: Request, res: Response) => {
  sendSuccessResponse(res, {
    statusCode: 200,
    message: 'Server is live',
    data: {
      status: 'LIVE',
      uptime: process.uptime(),
    },
  });
});

// 2. Readiness Probe (Checks if database and redis are online)
router.get('/ready', async (req: Request, res: Response) => {
  const redisOk = isRedisConnected();
  let dbOk = false;

  try {
    // Run simple lightweight query to verify PG connection
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (error: any) {
    logger.error(`💥 Readiness probe database ping failed: ${error.message}`);
  }

  if (dbOk && redisOk) {
    res.status(200).json({
      success: true,
      message: 'System is ready',
      data: {
        status: 'READY',
        postgres: 'CONNECTED',
        redis: 'CONNECTED',
      },
    });
  } else {
    res.status(503).json({
      success: false,
      message: 'System is not ready',
      errors: {
        status: 'DOWN',
        postgres: dbOk ? 'CONNECTED' : 'DISCONNECTED',
        redis: redisOk ? 'CONNECTED' : 'DISCONNECTED',
      },
    });
  }
});

// 3. Full Health Status Check with Queue Metrics & Graceful Degradation
router.get('/', async (req: Request, res: Response) => {
  let dbStatus = 'CONNECTED';
  let dbResponseTimeMs = 0;

  try {
    const start = process.hrtime();
    await prisma.$queryRaw`SELECT 1`;
    const diff = process.hrtime(start);
    dbResponseTimeMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
  } catch (error: any) {
    dbStatus = 'DISCONNECTED';
    logger.error(`💥 Health check database ping failed: ${error.message}`);
  }

  const redisConnected = isRedisConnected();
  const queueStatus = redisConnected ? 'ACTIVE' : 'INACTIVE';
  
  let queueMetrics = {
    activeJobs: 0,
    waitingJobs: 0,
    failedJobs: 0,
    completedJobs: 0,
  };

  if (redisConnected) {
    try {
      const counts = await evaluationQueue.getJobCounts(
        'active',
        'waiting',
        'failed',
        'completed'
      );
      queueMetrics = {
        activeJobs: counts.active || 0,
        waitingJobs: counts.waiting || 0,
        failedJobs: counts.failed || 0,
        completedJobs: counts.completed || 0,
      };
    } catch (queueErr: any) {
      logger.warn(`⚠️ Failed to retrieve BullMQ queue metrics: ${queueErr.message}`);
    }
  }

  const isHealthy = dbStatus === 'CONNECTED';

  const healthPayload = {
    status: isHealthy ? 'UP' : 'DOWN',
    version: '1.0.0',
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    postgres: {
      status: dbStatus,
      responseTimeMs: dbResponseTimeMs,
    },
    redis: {
      status: redisConnected ? 'CONNECTED' : 'DISCONNECTED',
    },
    queue: {
      status: queueStatus,
      ...queueMetrics,
    },
  };

  const responsePayload = {
    status: healthPayload.status,
    version: healthPayload.version,
    environment: healthPayload.environment,
    uptime: healthPayload.uptime,
    postgres: healthPayload.postgres,
    redis: healthPayload.redis,
    queue: healthPayload.queue,
    databaseStatus: dbStatus,
    databaseResponseTime: dbResponseTimeMs,
    success: isHealthy,
    message: isHealthy ? 'System health diagnostics' : 'System is unhealthy',
    data: healthPayload,
  };

  if (isHealthy) {
    res.status(200).json(responsePayload);
  } else {
    res.status(500).json({
      ...responsePayload,
      errors: healthPayload,
    });
  }
});

export default router;
