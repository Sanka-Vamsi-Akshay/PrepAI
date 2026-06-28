import { apiClient } from './api';

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  topic: string;
  starterCodeJava: string;
  starterCodePy: string;
  starterCodeJs: string;
  testCases: any;
  hiddenTestCases: any;
  createdAt: string;
  updatedAt: string;
}

export interface CodingSession {
  id: string;
  userId: string;
  interviewSessionId: string | null;
  codingProblemId: string;
  title: string;
  language: string;
  starterCode: string;
  userCode: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  difficulty: string;
  executionResult: any | null;
  createdAt: string;
  updatedAt: string;
  codingProblem?: CodingProblem;
  evaluation?: any | null;
  executions?: any[];
}

export const getProblems = async (): Promise<CodingProblem[]> => {
  const response = await apiClient.get('/coding/problems');
  return response.data.data.problems;
};

export const createSession = async (
  codingProblemId: string,
  language: string,
  interviewSessionId?: string | null
): Promise<CodingSession> => {
  const response = await apiClient.post('/coding/sessions', {
    codingProblemId,
    language,
    interviewSessionId: interviewSessionId || null,
  });
  return response.data.data.session;
};

export const getSessionById = async (id: string): Promise<CodingSession> => {
  const response = await apiClient.get(`/coding/sessions/${id}`);
  return response.data.data.session;
};

export const saveSessionCode = async (id: string, userCode: string): Promise<CodingSession> => {
  const response = await apiClient.patch(`/coding/sessions/${id}/save`, { userCode });
  return response.data.data.session;
};

export const runSessionCode = async (
  id: string,
  userCode: string
): Promise<{ success: boolean; stdout: string; stderr: string; compileError?: string; testResults: any[] }> => {
  const response = await apiClient.post(`/coding/sessions/${id}/run`, { userCode });
  return response.data.data;
};

export const submitSessionCode = async (
  id: string,
  userCode: string
): Promise<{ session: CodingSession; evaluation: any }> => {
  const response = await apiClient.post(`/coding/sessions/${id}/submit`, { userCode });
  return response.data.data;
};
