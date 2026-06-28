import { Response, NextFunction } from 'express';
import * as bookmarkService from '@backend/services/bookmark.service';
import { sendSuccessResponse } from '@backend/utils/response';
import { AuthenticatedRequest } from '@backend/types';

export const toggleBookmark = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { questionId } = req.body;

    if (!questionId) {
      res.status(400).json({ success: false, message: 'questionId is required' });
      return;
    }

    const result = await bookmarkService.toggleBookmark(userId, questionId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: result.bookmarked ? 'Question bookmarked successfully' : 'Question unbookmarked successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookmarkedQuestions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const questions = await bookmarkService.getBookmarkedQuestions(userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Bookmarked questions retrieved successfully',
      data: { questions },
    });
  } catch (error) {
    next(error);
  }
};
