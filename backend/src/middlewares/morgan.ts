import morgan, { StreamOptions } from 'morgan';
import { logger } from '@backend/config/logger';
import { env } from '@backend/config/env';

// Override the stream method to use winston instead of console.log
const stream: StreamOptions = {
  write: (message) => logger.http(message.trim()),
};

// Skip HTTP logging during test environment
const skip = () => {
  return env.NODE_ENV === 'test';
};

// Build the morgan middleware
export const morganMiddleware = morgan(
  env.NODE_ENV === 'development'
    ? ':method :url :status :res[content-length] - :response-time ms'
    : 'combined',
  { stream, skip }
);
