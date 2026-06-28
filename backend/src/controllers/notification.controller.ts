import { Response, NextFunction } from 'express';
import * as notificationService from '@backend/services/notification.service';
import { sendSuccessResponse } from '@backend/utils/response';
import { AuthenticatedRequest } from '@backend/types';

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const notifications = await notificationService.getNotifications(userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Notifications retrieved successfully',
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Notification marked as read successfully',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    await notificationService.markAllAsRead(userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'All notifications marked as read successfully',
    });
  } catch (error) {
    next(error);
  }
};
