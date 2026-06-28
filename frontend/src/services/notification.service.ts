import { apiClient } from './api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get('/notifications');
  return response.data.data.notifications;
};

export const markNotificationAsRead = async (id: string): Promise<Notification> => {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data.data.notification;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};
