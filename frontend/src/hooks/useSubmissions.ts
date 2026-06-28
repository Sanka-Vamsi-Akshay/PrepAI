import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  fetchSubmissions,
  fetchSubmissionById,
  createSubmission,
  updateSubmission,
  SubmissionsQueryParams,
} from '@/services/submission.service';

const QUERY_KEYS = {
  SUBMISSIONS: 'submissions',
  SUBMISSION: 'submission',
};

export const useSubmissions = (params: SubmissionsQueryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUBMISSIONS, params],
    queryFn: () => fetchSubmissions(params),
    placeholderData: keepPreviousData,
    staleTime: 1 * 60 * 1000,
  });
};

export const useSubmission = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUBMISSION, id],
    queryFn: () => fetchSubmissionById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubmission,
    onSuccess: (newSub) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBMISSIONS] });
      // Also invalidate query relating to this question's details state
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', newSub.questionId] });
    },
  });
};

export const useUpdateSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSubmission(id, data),
    onSuccess: (updatedSub) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBMISSIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBMISSION, updatedSub.id] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', updatedSub.questionId] });
    },
  });
};
