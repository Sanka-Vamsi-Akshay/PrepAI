import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { asyncLocalStorage } from '@backend/utils/als';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.header('x-request-id') || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);

  const store = new Map<string, any>();
  store.set('requestId', requestId);

  asyncLocalStorage.run(store, () => {
    next();
  });
};
