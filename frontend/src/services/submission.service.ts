import { apiClient } from './api';

export interface SubmissionsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  topic?: string;
}

export interface PaginatedSubmissionsResponse {
  submissions: any[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateSubmissionPayload {
  status?: string;
  notes?: string | null;
  timeSpent?: number;
  attemptCount?: number;
  reflection?: string | null;
}

export const fetchSubmissions = async (
  params: SubmissionsQueryParams
): Promise<PaginatedSubmissionsResponse> => {
  const response = await apiClient.get('/submissions', { params });
  return response.data.data;
};

export const fetchSubmissionById = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/submissions/${id}`);
  return response.data.data.submission;
};

export const createSubmission = async (payload: {
  questionId: string;
  status?: string;
}): Promise<any> => {
  const response = await apiClient.post('/submissions', payload);
  return response.data.data.submission;
};

export const updateSubmission = async (
  id: string,
  payload: UpdateSubmissionPayload
): Promise<any> => {
  const response = await apiClient.patch(`/submissions/${id}`, payload);
  return response.data.data.submission;
};
