import { useQuery } from '@tanstack/react-query';
import { fetchQuestionById } from '@/services/question.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useQuestion = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.QUESTION, id],
    queryFn: () => fetchQuestionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Stale after 5 mins
  });
};
export default useQuestion;
