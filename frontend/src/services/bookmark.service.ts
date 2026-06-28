import { apiClient } from './api';
import { Question } from '@/types';

export const toggleBookmark = async (questionId: string): Promise<{ bookmarked: boolean }> => {
  const response = await apiClient.post('/bookmarks/toggle', { questionId });
  return response.data.data;
};

export const fetchBookmarkedQuestions = async (): Promise<Question[]> => {
  const response = await apiClient.get('/bookmarks');
  return response.data.data.questions;
};
