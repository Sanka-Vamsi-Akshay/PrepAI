export interface OverviewAnalytics {
  totalQuestionsSolved: number;
  totalInterviewsCompleted: number;
  averageInterviewScore: number;
  totalStudyTime: number; // in seconds
  strongestTopic: string | null;
  weakestTopic: string | null;
  suggestedNextTopic: string | null;
  recommendedFocusArea: string | null;
  generatedAt: Date;
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
  confidenceScore: number | null;
}

export type PerformanceAnalytics = PerformanceTrendPoint[];

export interface TopicAnalyticsItem {
  topic: string;
  completionCount: number;
  averageScore: number;
  successPercentage: number;
}

export type TopicAnalytics = TopicAnalyticsItem[];

export interface SkillAnalytics {
  technicalAccuracy: number;
  communication: number;
  clarity: number;
  depth: number;
}
