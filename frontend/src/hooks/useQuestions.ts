import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchQuestions, QuestionsQueryParams } from '@/services/question.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useQuestions = (params: QuestionsQueryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.QUESTIONS, params],
    queryFn: () => fetchQuestions(params),
    placeholderData: keepPreviousData, // Retain previous results during page change transitions
    staleTime: 2 * 60 * 1000, // Stale after 2 mins
  });
};
export default useQuestions;
