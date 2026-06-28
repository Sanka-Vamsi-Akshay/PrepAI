import rateLimit from 'express-rate-limit';
import { appConfig } from '@backend/config/env';

export const rateLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.max,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 failed login/register attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only failed requests count against the rate limit
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after an hour',
  },
});

export const resumeUploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 resume uploads per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many resume uploads from this IP, please try again after 15 minutes',
  },
});

export const codeExecutionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 execution requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many code execution runs from this IP, please try again after 15 minutes',
  },
});

export const evaluationRetryRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 evaluation retries per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many evaluation retry attempts from this IP, please try again after 15 minutes',
  },
});

export const aiIntensiveRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 session creations/AI-intensive actions per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI-intensive requests from this IP, please try again after 15 minutes',
  },
});
