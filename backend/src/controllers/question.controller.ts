import { Request, Response, NextFunction } from 'express';
import * as questionService from '@backend/services/question.service';
import { sendSuccessResponse } from '@backend/utils/response';

export const getQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const result = await questionService.getQuestions(req.query as any, userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Questions retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const question = await questionService.getQuestionById(id, userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Question details retrieved successfully',
      data: { question },
    });
  } catch (error) {
    next(error);
  }
};
