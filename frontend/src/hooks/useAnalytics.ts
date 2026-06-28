import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAnalyticsOverview,
  fetchAnalyticsPerformance,
  fetchAnalyticsTopics,
  fetchAnalyticsSkills,
} from '@/services/analytics.service';

const ANALYTICS_QUERY_KEYS = {
  OVERVIEW: 'analytics_overview',
  PERFORMANCE: 'analytics_performance',
  TOPICS: 'analytics_topics',
  SKILLS: 'analytics_skills',
};

const STALE_TIME = 60000; // 1 minute stale time
const GC_TIME = 300000; // 5 minutes garbage collection time (gcTime replaces cacheTime in React Query v5)

export const useAnalyticsOverview = (refresh = false) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.OVERVIEW, refresh],
    queryFn: () => fetchAnalyticsOverview(refresh),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

export const useAnalyticsPerformance = (days = 7) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.PERFORMANCE, days],
    queryFn: () => fetchAnalyticsPerformance(days),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

export const useAnalyticsTopics = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.TOPICS],
    queryFn: () => fetchAnalyticsTopics(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

export const useAnalyticsSkills = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.SKILLS],
    queryFn: () => fetchAnalyticsSkills(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
};

export const useRefreshAnalyticsOverview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchAnalyticsOverview(true),
    onSuccess: (data) => {
      // Manually update query cache for overview queries
      queryClient.setQueryData([ANALYTICS_QUERY_KEYS.OVERVIEW, false], data);
      queryClient.setQueryData([ANALYTICS_QUERY_KEYS.OVERVIEW, true], data);
      // Invalidate all other analytics queries to trigger fresh calculations
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.PERFORMANCE] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.TOPICS] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.SKILLS] });
    },
  });
};
