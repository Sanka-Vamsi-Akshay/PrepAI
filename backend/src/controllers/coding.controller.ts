import { Request, Response, NextFunction } from 'express';
import * as codingService from '@backend/services/coding/coding.service';
import { sendSuccessResponse } from '@backend/utils/response';

export const getProblems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const problems = await codingService.getCodingProblems();
    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Coding problems retrieved successfully',
      data: { problems },
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const session = await codingService.createCodingSession(userId, req.body);
    sendSuccessResponse(res, {
      statusCode: 201,
      message: 'Coding session created successfully',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const session = await codingService.getCodingSessionById(id, userId);
    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Coding session retrieved successfully',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

export const saveSessionCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { userCode } = req.body;
    const session = await codingService.saveCode(id, userId, userCode);
    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Code saved successfully',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

export const runSessionCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { userCode } = req.body;
    const result = await codingService.runCode(id, userId, userCode);
    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Code executed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const submitSessionCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { userCode } = req.body;
    const result = await codingService.submitCode(id, userId, userCode);
    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Solution submitted and evaluated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
