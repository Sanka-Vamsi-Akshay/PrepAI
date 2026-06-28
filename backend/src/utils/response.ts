import { Response } from 'express';
import { env } from '@backend/config/env';

interface SuccessResponseOptions<T = any> {
  statusCode?: number;
  message?: string;
  data?: T;
}

interface ErrorResponseOptions {
  statusCode?: number;
  message?: string;
  errors?: any;
  stack?: string;
}

/**
 * Sends a standardized success API response.
 */
export const sendSuccessResponse = <T>(
  res: Response,
  options: SuccessResponseOptions<T>
): Response => {
  const { statusCode = 200, message = 'Success', data } = options;
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
};

/**
 * Sends a standardized error API response. Suppresses stack traces in production.
 */
export const sendErrorResponse = (
  res: Response,
  options: ErrorResponseOptions
): Response => {
  const { statusCode = 500, message = 'Error', errors, stack } = options;
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined && { errors }),
    ...(env.NODE_ENV === 'development' && stack && { stack }),
  });
};
