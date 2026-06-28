import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@backend/types';
import * as interviewService from '@backend/services/interview.service';
import { sendSuccessResponse } from '@backend/utils/response';

export const createInterviewSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const session = await interviewService.createInterviewSession(userId, req.body);

    sendSuccessResponse(res, {
      statusCode: 201,
      message: 'Interview session generated successfully',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewSessions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await interviewService.getInterviewSessions(userId, req.query as any);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Interview sessions retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewSessionById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const session = await interviewService.getInterviewSessionById(id, userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Interview session details retrieved successfully',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id, questionId } = req.params;
    const { userAnswer } = req.body;
    
    const answer = await interviewService.submitAnswer(id, questionId, userId, userAnswer);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Answer saved successfully',
      data: { answer },
    });
  } catch (error) {
    next(error);
  }
};

export const endInterviewSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { durationSeconds } = req.body;

    const session = await interviewService.endInterviewSession(id, userId, durationSeconds);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Interview session completed successfully',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewEvaluation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const evaluation = await interviewService.getInterviewEvaluation(id, userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Interview evaluation status retrieved successfully',
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

export const retryInterviewEvaluation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const result = await interviewService.retryInterviewEvaluation(id, userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Evaluation retry initiated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const quickStartSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const session = await interviewService.quickStartSession(userId);

    sendSuccessResponse(res, {
      statusCode: 201,
      message: 'Quick Start session created successfully',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};
