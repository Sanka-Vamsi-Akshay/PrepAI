import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { appConfig } from '../config/env';
import { ForbiddenError } from '../utils/appError';

const COOKIE_NAME = 'XSRF-TOKEN';
const HEADER_NAME = 'x-xsrf-token';

// Constant-time string comparison using crypto.timingSafeEqual
const safeCompare = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  
  if (bufA.length !== bufB.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
};

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const setCsrfCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, {
    path: '/',
    secure: appConfig.cookies.secure,
    sameSite: appConfig.cookies.sameSite,
    // Must be httpOnly: false so the frontend Axios client can read it
    httpOnly: false,
    maxAge: appConfig.cookies.maxAge,
  });
};

export const clearCsrfCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    path: '/',
    secure: appConfig.cookies.secure,
    sameSite: appConfig.cookies.sameSite,
    httpOnly: false,
  });
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  const cleanPath = req.path.replace(/\/+$/, ''); // normalize trailing slash
  const cookieToken = req.cookies?.[COOKIE_NAME];
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

  // 1. Exclude health and bootstrap endpoints from CSRF validation
  const isExempt = 
    cleanPath.startsWith('/api/v1/health') || 
    cleanPath.startsWith('/health') ||
    cleanPath.includes('/auth/bootstrap');

  // 2. Validate token on state-changing operations (excluding health and bootstrap endpoints)
  if (isStateChanging && !isExempt) {
    const headerToken = req.headers[HEADER_NAME] as string;

    if (!cookieToken || !headerToken || !safeCompare(cookieToken, headerToken)) {
      return next(new ForbiddenError('CSRF token validation failed: missing or mismatching token'));
    }
  }

  // 3. Ensure a CSRF token exists for the client
  let activeToken = cookieToken;
  if (!activeToken) {
    activeToken = generateCsrfToken();
    setCsrfCookie(res, activeToken);
  }

  (req as any).csrfToken = activeToken;

  next();
};
