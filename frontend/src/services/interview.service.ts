import { apiClient } from './api';

export interface CreateInterviewPayload {
  domain: string;
  difficulty: string;
  interviewType?: string;
  resumeId?: string | null;
  companyProfile?: string | null;
}

export interface SubmitAnswerPayload {
  userAnswer: string;
}

export interface EndInterviewPayload {
  durationSeconds?: number;
}

export const fetchInterviews = async (params?: { page?: number; limit?: number }): Promise<any> => {
  const response = await apiClient.get('/interviews', { params });
  return response.data.data;
};

export const fetchInterviewById = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/interviews/${id}`);
  return response.data.data.session;
};

export const createInterview = async (payload: CreateInterviewPayload): Promise<any> => {
  const response = await apiClient.post('/interviews', payload);
  return response.data.data.session;
};

export const submitInterviewAnswer = async (
  id: string,
  questionId: string,
  userAnswer: string
): Promise<any> => {
  const response = await apiClient.patch(`/interviews/${id}/questions/${questionId}/answer`, {
    userAnswer,
  });
  return response.data.data.answer;
};

export const endInterview = async (id: string, durationSeconds?: number): Promise<any> => {
  const response = await apiClient.patch(`/interviews/${id}/end`, { durationSeconds });
  return response.data.data.session;
};

export const fetchInterviewEvaluation = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/interviews/${id}/evaluation`);
  return response.data.data;
};

export const retryInterviewEvaluation = async (id: string): Promise<any> => {
  const response = await apiClient.post(`/interviews/${id}/evaluation/retry`);
  return response.data.data;
};
