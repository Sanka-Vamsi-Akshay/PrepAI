import Redis from 'ioredis';
import { Job } from 'bullmq';
import { env } from './env';
import { logger } from './logger';

// Monkeypatch BullMQ Job validator to bypass the colon restriction for our deterministic IDs
const originalValidateOptions = (Job.prototype as any).validateOptions;
if (originalValidateOptions) {
  (Job.prototype as any).validateOptions = function (jobData: any) {
    const originalJobId = this.opts?.jobId;
    if (originalJobId && typeof originalJobId === 'string' && originalJobId.includes(':')) {
      this.opts.jobId = 'a:b:c';
    }
    try {
      return originalValidateOptions.call(this, jobData);
    } finally {
      if (originalJobId !== undefined) {
        this.opts.jobId = originalJobId;
      }
    }
  };
}

let isConnected = false;

export const redisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD || undefined,

  tls: {},

  maxRetriesPerRequest: null, // Required by BullMQ
  retryStrategy(times: number) {
    const delay = Math.min(times * 100, 3000); // Exponential backoff capped at 3s
    logger.warn(`🔄 Redis connection retry attempt ${times} after ${delay}ms`);
    return delay;
  },
};

export const redisConnection = new Redis(redisOptions);

redisConnection.on('connect', () => {
  isConnected = true;
  logger.info('🚀 Connected to Redis successfully');
});

redisConnection.on('error', (err) => {
  isConnected = false;
  logger.warn(`⚠️ Redis error: ${err.message}`);
});

redisConnection.on('close', () => {
  isConnected = false;
  logger.warn('🔌 Redis connection closed');
});

export const isRedisConnected = (): boolean => {
  // If connection status is open or ready, we treat it as connected
  return isConnected || redisConnection.status === 'ready' || redisConnection.status === 'connect';
};
