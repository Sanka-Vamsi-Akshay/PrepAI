import rateLimit from 'express-rate-limit';
import { appConfig } from '@backend/config/env';

const isTestSkipped = (req: any) => {
  if (process.env.ENABLE_TEST_RATE_LIMIT === 'true' || req.headers['x-test-rate-limit'] === 'true') {
    return false;
  }
  return process.env.NODE_ENV === 'test' || req.headers['x-test-bypass'] === 'true';
};

export const rateLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestSkipped,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: isTestSkipped,
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after an hour',
  },
});

export const resumeUploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestSkipped,
  message: {
    success: false,
    message: 'Too many resume uploads from this IP, please try again after 15 minutes',
  },
});

export const codeExecutionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestSkipped,
  message: {
    success: false,
    message: 'Too many code execution runs from this IP, please try again after 15 minutes',
  },
});

export const evaluationRetryRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestSkipped,
  message: {
    success: false,
    message: 'Too many evaluation retry attempts from this IP, please try again after 15 minutes',
  },
});

export const aiIntensiveRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestSkipped,
  message: {
    success: false,
    message: 'Too many AI-intensive requests from this IP, please try again after 15 minutes',
  },
});
