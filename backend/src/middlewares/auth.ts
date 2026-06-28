import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@backend/config/env';
import { UnauthorizedError, ForbiddenError } from '@backend/utils/appError';
import { AuthenticatedRequest } from '@backend/types/index';

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from HTTP-Only cookies
    const token = req.cookies?.token;

    if (!token) {
      throw new UnauthorizedError('Authentication required: Token missing');
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: string;
        role: string;
      };

      req.user = {
        id: decoded.userId,
        role: decoded.role,
      };

      /*
       * TODO: [Refresh Token Validation Placeholder]
       * If access token is expired, check if a valid refresh token cookie exists to issue a new access token.
       */

      next();
    } catch (err) {
      throw new UnauthorizedError('Authentication failed: Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError('You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
