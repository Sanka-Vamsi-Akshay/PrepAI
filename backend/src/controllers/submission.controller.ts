import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@backend/types';
import * as submissionService from '@backend/services/submission.service';
import { sendSuccessResponse } from '@backend/utils/response';

export const createSubmission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const submission = await submissionService.createSubmission(userId, req.body);

    sendSuccessResponse(res, {
      statusCode: 201,
      message: 'Submission created successfully',
      data: { submission },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await submissionService.getSubmissions(userId, req.query as any);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Submissions retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const submission = await submissionService.getSubmissionById(id, userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Submission details retrieved successfully',
      data: { submission },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubmission = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const submission = await submissionService.updateSubmission(id, userId, req.body);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Submission updated successfully',
      data: { submission },
    });
  } catch (error) {
    next(error);
  }
};
