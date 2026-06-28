import { prisma } from '@backend/config/db';
import { Notification } from '@prisma/client';

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string,
  link?: string
): Promise<Notification> => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
    },
  });
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const markAsRead = async (id: string, userId: string): Promise<Notification> => {
  return prisma.notification.update({
    where: { id, userId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId: string): Promise<any> => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
