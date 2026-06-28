import app from '@backend/app';
import { env } from '@backend/config/env';
import { logger } from '@backend/config/logger';
import { prisma } from '@backend/config/db';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

// Handle graceful shutdowns
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed.');
  });

  // Close database connection
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  } catch (err) {
    logger.error('Error during database disconnect:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  logger.error('💥 Uncaught Exception! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('💥 Unhandled Rejection! Shutting down...', reason as Error);
  process.exit(1);
});
