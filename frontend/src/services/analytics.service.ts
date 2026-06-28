import { apiClient } from './api';

export interface OverviewAnalytics {
  totalQuestionsSolved: number;
  totalInterviewsCompleted: number;
  averageInterviewScore: number;
  totalStudyTime: number; // in seconds
  strongestTopic: string | null;
  weakestTopic: string | null;
  suggestedNextTopic: string | null;
  recommendedFocusArea: string | null;
  generatedAt: string;
  resumeStrengthScore?: number | null;
  resumeMissingSkillsCount?: number | null;
  resumeStrongestArea?: string | null;
  resumeWeakestArea?: string | null;
  resumeLearningRoadmap?: any | null;
  averageResumeAlignment?: number | null;
  averageConsistencyScore?: number | null;
  companyReadiness?: any | null;
  strongestCompanyProfile?: string | null;
  weakestCompanyProfile?: string | null;
  codingProblemsSolved?: number;
  averageCodingScore?: number;
  codingStats?: any | null;
}

export interface PerformanceTrendPoint {
  date: string;
  interviewScore: number | null;
  questionsSolved: number;
  studyTime: number; // in minutes
  confidenceScore?: number | null;
}

export interface TopicAnalyticsItem {
  topic: string;
  completionCount: number;
  averageScore: number;
  successPercentage: number;
}

export interface SkillAnalytics {
  technicalAccuracy: number;
  communication: number;
  clarity: number;
  depth: number;
}

export const fetchAnalyticsOverview = async (refresh = false): Promise<OverviewAnalytics> => {
  const response = await apiClient.get('/analytics/overview', {
    params: { refresh: refresh ? 'true' : undefined },
  });
  return response.data.data;
};

export const fetchAnalyticsPerformance = async (days = 7): Promise<PerformanceTrendPoint[]> => {
  const response = await apiClient.get('/analytics/performance', {
    params: { days },
  });
  return response.data.data;
};

export const fetchAnalyticsTopics = async (): Promise<TopicAnalyticsItem[]> => {
  const response = await apiClient.get('/analytics/topics');
  return response.data.data;
};

export const fetchAnalyticsSkills = async (): Promise<SkillAnalytics> => {
  const response = await apiClient.get('/analytics/skills');
  return response.data.data;
};
