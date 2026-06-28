import { Request, Response, NextFunction } from 'express';
import { AppError } from '@backend/utils/appError';
import { logger } from '@backend/config/logger';
import { sendErrorResponse } from '@backend/utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Prisma errors (e.g. duplicate keys)
  if (err.name === 'PrismaClientKnownRequestError') {
    const code = (err as any).code;
    if (code === 'P2002') {
      statusCode = 409;
      message = 'Duplicate field value entered';
      errors = (err as any).meta?.target;
    } else if (code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    }
  }

  // Log error
  if (statusCode === 500) {
    logger.error(`💥 Non-Operational Error: ${err.message} \nStack: ${err.stack}`);
  } else {
    logger.warn(`⚠️ Operational Error [${statusCode}]: ${err.message}`);
  }

  // Send response in standardized format
  sendErrorResponse(res, {
    statusCode,
    message,
    errors,
    stack: err.stack,
  });
};
