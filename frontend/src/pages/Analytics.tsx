import React, { useState } from 'react';
import { 
  useAnalyticsOverview, 
  useAnalyticsPerformance, 
  useAnalyticsTopics, 
  useAnalyticsSkills,
  useRefreshAnalyticsOverview
} from '@/hooks/useAnalytics';
import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';
import { ScoreTrendChart } from '@/components/analytics/ScoreTrendChart';
import { StudyTimeChart } from '@/components/analytics/StudyTimeChart';
import { QuestionsSolvedChart } from '@/components/analytics/QuestionsSolvedChart';
import { TopicPerformanceChart } from '@/components/analytics/TopicPerformanceChart';
import { SkillBreakdownChart } from '@/components/analytics/SkillBreakdownChart';
import { InsightCard } from '@/components/analytics/InsightCard';
import { 
  BookOpen, 
  Award, 
  Clock, 
  Activity, 
  RotateCw, 
  AlertCircle,
  HelpCircle,
  Building,
  ThumbsUp,
  ThumbsDown,
  ListTodo
} from 'lucide-react';

const COMPANY_NAMES: Record<string, string> = {
  GOOGLE: 'Google',
  META: 'Meta',
  AMAZON: 'Amazon',
  MICROSOFT: 'Microsoft',
  STARTUP: 'Startup',
  ACCENTURE: 'Accenture',
  TCS: 'TCS',
  INFOSYS: 'Infosys',
  WIPRO: 'Wipro',
};

export const Analytics: React.FC = () => {
  const [days, setDays] = useState<7 | 30 | 90>(7);

  // React Query hooks
  const { data: overview, isLoading: isOverviewLoading, isError: isOverviewError } = useAnalyticsOverview();
  const { data: performance, isLoading: isPerformanceLoading, isError: isPerformanceError } = useAnalyticsPerformance(days);
  const { data: topics, isLoading: isTopicsLoading, isError: isTopicsError } = useAnalyticsTopics();
  const { data: skills, isLoading: isSkillsLoading, isError: isSkillsError } = useAnalyticsSkills();

  const refreshMutation = useRefreshAnalyticsOverview();

  const companyReadiness = (overview?.companyReadiness || {}) as Record<string, any>;
  const strongestCompanyProfile = overview?.strongestCompanyProfile;
  const weakestCompanyProfile = overview?.weakestCompanyProfile;
  const hasCompanyData = Object.keys(companyReadiness).length > 0;

  const formatStudyTime = (seconds: number) => {
    if (seconds === 0) return '0h';
    const hours = Math.round(seconds / 3600 * 10) / 10;
    return `${hours}h`;
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const isGlobalError = isOverviewError || isPerformanceError || isTopicsError || isSkillsError;
  const isGlobalLoading = isOverviewLoading || isPerformanceLoading || isTopicsLoading || isSkillsLoading;

  if (isGlobalError) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
        <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">Failed to Load Analytics</h3>
        <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
          There was an error communicating with the database analytics service. Please verify your connection and try again.
        </p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  // Check empty state
  const hasNoActivity = overview && overview.totalQuestionsSolved === 0 && overview.totalInterviewsCompleted === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-200">
            Analytics Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
            Gain technical metrics, rubric performance progress, and topic readiness score analysis.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshMutation.isPending || isGlobalLoading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-50 transition-colors"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          {refreshMutation.isPending ? 'Recalculating...' : 'Forced Refresh'}
        </button>
      </div>

      {/* Empty state alert banner */}
      {hasNoActivity && (
        <div className="p-5 rounded-xl border border-blue-500/10 bg-blue-500/5 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-450">Complete your first interview to unlock analytics</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed">
              Once you complete question practices or simulated AI interview sessions, this dashboard will generate deep insights about your technical accuracy, speed, and strengths.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Questions Solved"
          value={overview?.totalQuestionsSolved ?? 0}
          description="Total completed coding bank submissions"
          icon={BookOpen}
          isLoading={isOverviewLoading}
        />
        <AnalyticsCard
          title="Interviews Completed"
          value={overview?.totalInterviewsCompleted ?? 0}
          description="Total finished simulated AI sessions"
          icon={Activity}
          isLoading={isOverviewLoading}
        />
        <AnalyticsCard
          title="Average Interview Score"
          value={overview ? `${overview.averageInterviewScore}%` : '0%'}
          description="Average score across overall rubrics"
          icon={Award}
          isLoading={isOverviewLoading}
        />
        <AnalyticsCard
          title="Total Study Time"
          value={overview ? formatStudyTime(overview.totalStudyTime) : '0h'}
          description="Accumulated coding and interview duration"
          icon={Clock}
          isLoading={isOverviewLoading}
        />
      </div>

      {/* Section 2: Performance Charts (with day filters) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">
            Performance & Activity Trends
          </span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all duration-150 ${
                  days === d
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm'
                    : 'text-slate-450 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ScoreTrendChart data={performance ?? []} isLoading={isPerformanceLoading} />
          <StudyTimeChart data={performance ?? []} isLoading={isPerformanceLoading} />
          <QuestionsSolvedChart data={performance ?? []} isLoading={isPerformanceLoading} />
        </div>
      </div>

      {/* Section 3 & 4: Skill Breakdown & Topic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillBreakdownChart data={skills ?? { technicalAccuracy: 0, communication: 0, clarity: 0, depth: 0 }} isLoading={isSkillsLoading} />
        <TopicPerformanceChart data={topics ?? []} isLoading={isTopicsLoading} />
      </div>

      {/* Section 5: AI Insights */}
      {overview && (
        <InsightCard
          strongestTopic={overview.strongestTopic === 'N/A' && overview.totalQuestionsSolved < 3 ? null : overview.strongestTopic}
          weakestTopic={overview.weakestTopic === 'N/A' && overview.totalQuestionsSolved < 3 ? null : overview.weakestTopic}
          suggestedNextTopic={overview.suggestedNextTopic}
          recommendedFocusArea={overview.totalInterviewsCompleted === 0 ? null : overview.recommendedFocusArea}
          isLoading={isOverviewLoading}
        />
      )}

      {/* Company Specific Readiness Insights Section */}
      {overview && (
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
          <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">
            Company Specific Readiness Insights
          </span>

          {!hasCompanyData ? (
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2 shadow-sm">
              <Building className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No company practice data yet</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-450 max-w-sm mx-auto leading-relaxed">
                Start an AI mock session with a target company profile (e.g. Google, Amazon, Meta) from the mock setup menu to track company-specific alignment scores and readiness metrics.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Highlight Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {strongestCompanyProfile && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-450 tracking-wider">Strongest Target Profile</span>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {COMPANY_NAMES[strongestCompanyProfile] || strongestCompanyProfile}
                      </h4>
                      <p className="text-[9px] text-slate-500">Highest readiness rating based on interview scores.</p>
                    </div>
                    <span className="text-2xl font-black text-emerald-500">
                      {companyReadiness[strongestCompanyProfile]?.readinessScore}%
                    </span>
                  </div>
                )}
                {weakestCompanyProfile && (
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-rose-600 dark:text-rose-455 tracking-wider font-extrabold">Focus Target Profile</span>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {COMPANY_NAMES[weakestCompanyProfile] || weakestCompanyProfile}
                      </h4>
                      <p className="text-[9px] text-slate-500">Target requires the most practice and refinement.</p>
                    </div>
                    <span className="text-2xl font-black text-rose-500">
                      {companyReadiness[weakestCompanyProfile]?.readinessScore}%
                    </span>
                  </div>
                )}
              </div>

              {/* Company Scores List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Readiness Scores Bar */}
                <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-250">Target Readiness Scores</span>
                  <div className="space-y-3">
                    {Object.entries(companyReadiness).map(([company, data]: [string, any]) => (
                      <div key={company} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-700 dark:text-slate-350">
                          <span>{COMPANY_NAMES[company] || company}</span>
                          <span>{data.readinessScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-505 rounded-full transition-all" 
                            style={{ width: `${data.readinessScore}%`, backgroundColor: '#6366f1' }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common weaknesses & recommendations details */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-250">Target Alignment Feedback</span>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(companyReadiness).map(([company, data]: [string, any]) => (
                      <div key={company} className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-850 last:border-0 last:pb-0">
                        <h4 className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-wide">
                          {COMPANY_NAMES[company] || company} Target
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-slate-655 dark:text-slate-400">
                          <div className="space-y-1">
                            <span className="font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1">
                              <ThumbsDown className="w-3 h-3" /> Common Weaknesses
                            </span>
                            <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
                              {data.weaknesses && data.weaknesses.length > 0 ? (
                                data.weaknesses.map((w: string, idx: number) => <li key={idx}>{w}</li>)
                              ) : (
                                <li className="italic text-slate-500 list-none pl-0">None logged.</li>
                              )}
                            </ul>
                          </div>

                          <div className="space-y-1">
                            <span className="font-bold text-emerald-600 dark:text-emerald-450 flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5" /> Recommended Actions
                            </span>
                            <ul className="list-disc pl-4 space-y-0.5 leading-relaxed">
                              {data.recommendations && data.recommendations.length > 0 ? (
                                data.recommendations.map((r: string, idx: number) => <li key={idx}>{r}</li>)
                              ) : (
                                <li className="italic text-slate-500 list-none pl-0">None logged.</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resume Intelligence Section */}
      {overview && overview.resumeStrengthScore !== undefined && overview.resumeStrengthScore !== null && (
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
          <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">
            Resume Intelligence Insights
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Resume Score & Gaps */}
            <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-250">Resume Strength</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                  {overview.resumeStrengthScore}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-slate-550">
                  <span>Missing Skills Count</span>
                  <span className="font-bold text-rose-500">{overview.resumeMissingSkillsCount ?? 0}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-550">
                  <span>Resume Strongest Area</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{overview.resumeStrongestArea || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-550">
                  <span>Resume Weakest Area</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{overview.resumeWeakestArea || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-550">
                  <span>Avg Resume Alignment</span>
                  <span className="font-bold text-blue-500">
                    {overview.averageResumeAlignment !== null && overview.averageResumeAlignment !== undefined
                      ? `${overview.averageResumeAlignment}%`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-550">
                  <span>Avg Consistency Score</span>
                  <span className="font-bold text-amber-500">
                    {overview.averageConsistencyScore !== null && overview.averageConsistencyScore !== undefined
                      ? `${overview.averageConsistencyScore}%`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Learning Roadmap timeline */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-250">Suggested Learning Roadmap</span>
              <div className="space-y-3">
                {(!overview.resumeLearningRoadmap || overview.resumeLearningRoadmap.length === 0) ? (
                  <p className="text-[10px] text-slate-555 italic">No roadmap items generated.</p>
                ) : (
                  (overview.resumeLearningRoadmap as any[]).slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start relative pl-4 border-l-2 border-slate-150 dark:border-slate-850 pb-2 last:pb-0">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                        <p className="text-[9px] text-slate-500 dark:text-slate-450 leading-relaxed">{item.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.skills?.map((skill: string, sIdx: number) => (
                            <span key={sIdx} className="text-[8px] font-semibold bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coding Sandbox Intelligence Section */}
      {overview && overview.codingProblemsSolved !== undefined && (
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
          <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">
            Coding Sandbox Intelligence
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coding Problems Overview */}
            <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-850 dark:text-slate-250">Coding Performance</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold border border-indigo-500/20 bg-indigo-500/10 text-indigo-500">
                  {overview.averageCodingScore ?? 0}% Avg
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] text-slate-550">
                  <span>Problems Solved</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{overview.codingProblemsSolved ?? 0}</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-850 pt-2 space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-450">
                    <span>Easy Solved</span>
                    <span className="font-semibold text-emerald-500">{overview.codingStats?.easySolvedCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-450">
                    <span>Medium Solved</span>
                    <span className="font-semibold text-amber-500">{overview.codingStats?.mediumSolvedCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-450">
                    <span>Hard Solved</span>
                    <span className="font-semibold text-rose-500">{overview.codingStats?.hardSolvedCount ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sandbox Language & Success Rates */}
            <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
              <span className="text-xs font-bold text-slate-850 dark:text-slate-250">Sandbox execution & compiler rates</span>
              <div className="space-y-3 text-[10px] text-slate-550">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-450">Language Usage</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {overview.codingStats?.languageUsage && Object.keys(overview.codingStats.languageUsage).length > 0 ? (
                      Object.entries(overview.codingStats.languageUsage).map(([lang, count]: [string, any]) => (
                        <span key={lang} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[9px] font-bold text-slate-600 dark:text-slate-300 capitalize">
                          {lang}: {count}
                        </span>
                      ))
                    ) : (
                      <span className="italic text-slate-500">No language data.</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-2 space-y-2">
                  <span className="font-semibold text-slate-450">Success Rate by Difficulty</span>
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Easy Success</span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{overview.codingStats?.successRateByDifficulty?.easy ?? 0}%</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Medium Success</span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{overview.codingStats?.successRateByDifficulty?.medium ?? 0}%</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Hard Success</span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{overview.codingStats?.successRateByDifficulty?.hard ?? 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
              <span className="text-xs font-bold text-slate-850 dark:text-slate-250">Coding Topic Insights</span>
              <div className="space-y-3 text-[10px] text-slate-550">
                <div className="space-y-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                    Strongest Coding Topics
                  </span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {overview.codingStats?.topicStrengths && overview.codingStats.topicStrengths.length > 0 ? (
                      overview.codingStats.topicStrengths.map((topic: string) => (
                        <span key={topic} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded text-[8px] font-semibold uppercase">
                          {topic.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="italic text-slate-500">Complete more challenges to calculate strengths.</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-2 space-y-1">
                  <span className="font-bold text-rose-600 dark:text-rose-500 flex items-center gap-1">
                    Weakest Coding Topics
                  </span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {overview.codingStats?.topicWeaknesses && overview.codingStats.topicWeaknesses.length > 0 ? (
                      overview.codingStats.topicWeaknesses.map((topic: string) => (
                        <span key={topic} className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-2 py-0.5 rounded text-[8px] font-semibold uppercase">
                          {topic.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="italic text-slate-500">None detected. Keep practicing!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Analytics;
