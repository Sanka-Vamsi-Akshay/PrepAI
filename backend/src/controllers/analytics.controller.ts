import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@backend/types';
import * as analyticsService from '@backend/services/analytics.service';
import { sendSuccessResponse } from '@backend/utils/response';
import { getPerformanceQuerySchema, getOverviewQuerySchema } from '@backend/validators/analytics.validator';
import { BadRequestError } from '@backend/utils/appError';

export const getOverview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Parse query params using validator
    const parsed = getOverviewQuerySchema.safeParse(req);
    const refresh = parsed.success ? parsed.data.query.refresh : false;

    const data = await analyticsService.getAnalyticsOverview(userId, refresh);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Overview analytics retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getPerformance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Parse query params using validator
    const parsed = getPerformanceQuerySchema.safeParse(req);
    if (!parsed.success) {
      throw new BadRequestError('Invalid query parameters: days must be 7, 30, or 90');
    }

    const { days } = parsed.data.query;
    const data = await analyticsService.getPerformanceAnalytics(userId, days);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: `Performance trends for the last ${days} days retrieved successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await analyticsService.getTopicAnalytics(userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Topic performance analytics retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSkills = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await analyticsService.getSkillAnalytics(userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Skill breakdown metrics retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};
