import { apiClient } from './api';
import { Question } from '@/types';

export interface QuestionsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: string;
  category?: string;
  topic?: string;
  bookmarked?: string;
}

export interface PaginatedQuestionsResponse {
  questions: Question[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const fetchQuestions = async (
  params: QuestionsQueryParams
): Promise<PaginatedQuestionsResponse> => {
  const response = await apiClient.get('/questions', { params });
  return response.data.data;
};

export const fetchQuestionById = async (id: string): Promise<Question> => {
  const response = await apiClient.get(`/questions/${id}`);
  return response.data.data.question;
};
