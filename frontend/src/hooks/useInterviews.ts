import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchInterviews,
  fetchInterviewById,
  createInterview,
  submitInterviewAnswer,
  endInterview,
  fetchInterviewEvaluation,
  retryInterviewEvaluation,
} from '@/services/interview.service';

const QUERY_KEYS = {
  INTERVIEWS: 'interviews',
  INTERVIEW: 'interview',
  INTERVIEW_EVALUATION: 'interview_evaluation',
};

export const useInterviews = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INTERVIEWS, params],
    queryFn: () => fetchInterviews(params),
    staleTime: 1 * 60 * 1000,
  });
};

export const useInterview = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INTERVIEW, id],
    queryFn: () => fetchInterviewById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1500, // Caches interview profile
  });
};

export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERVIEWS] });
    },
  });
};

export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, questionId, userAnswer }: { id: string; questionId: string; userAnswer: string }) =>
      submitInterviewAnswer(id, questionId, userAnswer),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERVIEW, variables.id] });
    },
  });
};

export const useEndInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, durationSeconds }: { id: string; durationSeconds?: number }) =>
      endInterview(id, durationSeconds),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERVIEWS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERVIEW, session.id] });
    },
  });
};

export const useInterviewEvaluation = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INTERVIEW_EVALUATION, id],
    queryFn: () => fetchInterviewEvaluation(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000; // Poll initially if no data
      // Stop polling when status becomes COMPLETED or FAILED
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        return false;
      }
      return 2000; // Poll every 2s otherwise (PENDING, NOT_STARTED)
    },
  });
};

export const useRetryEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retryInterviewEvaluation,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INTERVIEW_EVALUATION, id] });
    },
  });
};
