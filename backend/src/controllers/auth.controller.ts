import { Request, Response, NextFunction } from 'express';
import * as authService from '@backend/services/auth.service';
import { appConfig } from '@backend/config/env';
import { AuthenticatedRequest } from '@backend/types';
import { prisma } from '@backend/config/db';
import { sendSuccessResponse, sendErrorResponse } from '@backend/utils/response';
import { generateCsrfToken, setCsrfCookie, clearCsrfCookie } from '@backend/middlewares/csrf';

const COOKIE_NAME = 'token';

const getCookieOptions = () => ({
  ...appConfig.cookies,
  path: '/',
});

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, token } = await authService.registerUser(req.body);

    // Set JWT in secure httpOnly cookie
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    // Rotate CSRF token on registration
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    sendSuccessResponse(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, token } = await authService.loginUser(req.body);

    // Set JWT in secure httpOnly cookie
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    // Rotate CSRF token on login
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Logged in successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Clear JWT cookie
    res.clearCookie(COOKIE_NAME, {
      ...appConfig.cookies,
      path: '/',
    });

    // Clear CSRF cookie on logout
    clearCsrfCookie(res);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendErrorResponse(res, {
        statusCode: 401,
        message: 'Unauthorized: User context missing',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendErrorResponse(res, {
        statusCode: 404,
        message: 'User profile not found',
      });
      return;
    }

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'User session verified successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const bootstrap = async (req: Request, res: Response): Promise<void> => {
  const csrfToken = req.cookies?.['XSRF-TOKEN'] || (req as any).csrfToken;

  sendSuccessResponse(res, {
    statusCode: 200,
    message: 'CSRF token initialized successfully',
    data: { csrfToken },
  });
};
