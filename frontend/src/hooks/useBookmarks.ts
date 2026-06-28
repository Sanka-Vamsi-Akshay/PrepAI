import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleBookmark, fetchBookmarkedQuestions } from '@/services/bookmark.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => toggleBookmark(questionId),
    onSuccess: () => {
      // Invalidate questions so their bookmarked status is refreshed
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUESTIONS] });
    },
  });
};

export const useBookmarkedQuestions = () => {
  return useQuery({
    queryKey: ['bookmarkedQuestions'],
    queryFn: fetchBookmarkedQuestions,
  });
};
