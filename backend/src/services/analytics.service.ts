import { prisma } from '@backend/config/db';
import { 
  OverviewAnalytics, 
  PerformanceAnalytics, 
  TopicAnalytics, 
  SkillAnalytics
} from '@backend/types/analytics';
import { InterviewDomain, EvaluationStatus, CompanyProfile } from '@prisma/client';
import { logger } from '@backend/config/logger';

// List of target topics required by specifications
const TARGET_TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'SQL',
  'Behavioral',
  'System Design',
];

/**
 * Deterministic helper to classify any question text + session domain into one of the 9 target topics.
 */
export const classifyQuestionTopic = (questionText: string, domain: InterviewDomain): string => {
  const text = questionText.toLowerCase();
  
  if (domain === InterviewDomain.SQL) return 'SQL';
  if (domain === InterviewDomain.SYSTEM_DESIGN) return 'System Design';
  if (domain === InterviewDomain.BEHAVIORAL) return 'Behavioral';
  
  // Keyword classification for Data Structures & Algorithms
  if (text.includes('tree') || text.includes('bst') || text.includes('binary tree') || text.includes('node')) {
    if (text.includes('list')) return 'Linked Lists'; // handles nodes in lists
    return 'Trees';
  }
  if (text.includes('graph') || text.includes('dfs') || text.includes('bfs') || text.includes('vertex') || text.includes('edge') || text.includes('shortest path') || text.includes('dijkstra')) {
    return 'Graphs';
  }
  if (text.includes('linked list') || text.includes('list') || text.includes('pointer')) {
    return 'Linked Lists';
  }
  if (text.includes('string') || text.includes('char') || text.includes('anagram') || text.includes('palindrome') || text.includes('substring')) {
    return 'Strings';
  }
  if (text.includes('dynamic programming') || text.includes('dp') || text.includes('memoization') || text.includes('subset') || text.includes('knapsack') || text.includes('subsequence') || text.includes('longest increasing')) {
    return 'Dynamic Programming';
  }
  
  return 'Arrays'; // Default DSA fallback
};

import { env } from '@backend/config/env';

/**
 * Overview Service: Returns fast overview metrics utilizing AnalyticsSnapshot as a cache.
 * Recalculates if refresh=true or snapshot is stale based on ANALYTICS_CACHE_TTL_SECONDS.
 */
export const getAnalyticsOverview = async (
  userId: string,
  refresh = false
): Promise<OverviewAnalytics> => {
  const snapshot = await prisma.analyticsSnapshot.findUnique({
    where: { userId },
  });

  // Calculate alignment and consistency scores dynamically from Evaluations
  const personalizedAverages = await prisma.interviewEvaluation.aggregate({
    where: {
      session: {
        userId,
        interviewType: 'PERSONALIZED',
        evaluationStatus: 'COMPLETED',
      },
    },
    _avg: {
      resumeAlignmentScore: true,
      consistencyScore: true,
    },
  });

  const averageResumeAlignment = personalizedAverages._avg.resumeAlignmentScore !== null
    ? Math.round(personalizedAverages._avg.resumeAlignmentScore)
    : null;

  const averageConsistencyScore = personalizedAverages._avg.consistencyScore !== null
    ? Math.round(personalizedAverages._avg.consistencyScore)
    : null;

  // Helper to dynamically calculate Insights based on real-time topics and skills
  const computeInsights = async () => {
    const [skills, topics] = await Promise.all([
      getSkillAnalytics(userId),
      getTopicAnalytics(userId),
    ]);

    // suggestedNextTopic logic
    const uncompleted = topics.find((t) => t.completionCount === 0);
    const sorted = [...topics].sort((a, b) => a.averageScore - b.averageScore);
    const weakest = sorted[0];
    const suggestedNextTopic = uncompleted ? uncompleted.topic : (weakest ? weakest.topic : 'N/A');

    // recommendedFocusArea logic
    const skillScores = [
      { name: 'Technical Accuracy', score: skills.technicalAccuracy, desc: 'Practice coding syntax, edge cases, and runtime complexities (Big O).' },
      { name: 'Communication', score: skills.communication, desc: 'Work on explaining your thought process out loud using the STAR method.' },
      { name: 'Clarity', score: skills.clarity, desc: 'Avoid rambling. Focus on structured, direct answers and clear modular code blocks.' },
      { name: 'Depth', score: skills.depth, desc: 'Study architectural tradeoffs, system limitations, and concurrency controls.' },
    ];
    const sortedSkills = [...skillScores].sort((a, b) => a.score - b.score);
    const recommendedFocusArea = sortedSkills[0].score > 0 ? sortedSkills[0].desc : 'Complete your first AI mock session to identify focus areas.';

    return { suggestedNextTopic, recommendedFocusArea };
  };

  const ttlSeconds = env.ANALYTICS_CACHE_TTL_SECONDS || 300;
  const staleTimeThreshold = new Date(Date.now() - ttlSeconds * 1000);

  // Return cached snapshot directly without running computeInsights if it is fresh
  if (snapshot && snapshot.generatedAt > staleTimeThreshold && !refresh) {
    logger.info(`⚡ Returning cached analytics snapshot for user ${userId} (TTL: ${ttlSeconds}s)`);
    const latestResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return {
      totalQuestionsSolved: snapshot.totalQuestionsSolved,
      totalInterviewsCompleted: snapshot.totalInterviewsCompleted,
      averageInterviewScore: snapshot.averageInterviewScore,
      totalStudyTime: snapshot.studyTimeSeconds,
      strongestTopic: snapshot.strongestTopic,
      weakestTopic: snapshot.weakestTopic,
      suggestedNextTopic: snapshot.suggestedNextTopic,
      recommendedFocusArea: snapshot.recommendedFocusArea,
      generatedAt: snapshot.generatedAt,
      resumeStrengthScore: latestResume ? (latestResume.insights as any)?.strengthScore : null,
      resumeMissingSkillsCount: latestResume ? (latestResume.insights as any)?.missingSkills?.length : null,
      resumeStrongestArea: latestResume ? (latestResume.insights as any)?.strongestAreas?.[0] : null,
      resumeWeakestArea: latestResume ? (latestResume.insights as any)?.weakestAreas?.[0] : null,
      resumeLearningRoadmap: latestResume ? (latestResume.insights as any)?.learningRoadmap : null,
      averageResumeAlignment,
      averageConsistencyScore,
      companyReadiness: snapshot.companyReadiness,
      strongestCompanyProfile: snapshot.strongestCompanyProfile,
      weakestCompanyProfile: snapshot.weakestCompanyProfile,
      codingProblemsSolved: snapshot.codingProblemsSolved,
      averageCodingScore: snapshot.averageCodingScore,
      codingStats: snapshot.codingStats,
    };
  }

  logger.info(`🔄 Recalculating overview analytics snapshot for user ${userId}`);

  // Fetch metrics from raw database data
  const [
    totalQuestionsSolved,
    totalInterviewsCompleted,
    averageScoreData,
    submissionsStudyTime,
    interviewsStudyTime,
    topicPerformance,
    companyInterviews,
  ] = await Promise.all([
    // 1. Total questions solved (COMPLETED submissions)
    prisma.submission.count({
      where: { userId, status: 'COMPLETED' },
    }),
    // 2. Total interviews completed (COMPLETED sessions)
    prisma.interviewSession.count({
      where: { userId, status: 'COMPLETED' },
    }),
    // 3. Average interview score
    prisma.interviewEvaluation.aggregate({
      where: { session: { userId } },
      _avg: { overallScore: true },
    }),
    // 4. Submissions study time
    prisma.submission.aggregate({
      where: { userId },
      _sum: { timeSpent: true },
    }),
    // 5. Interviews study time
    prisma.interviewSession.aggregate({
      where: { userId },
      _sum: { durationSeconds: true },
    }),
    // 6. Topic stats to determine strongest and weakest
    getTopicAnalytics(userId),
    // 7. Company mock interviews to cache stats
    prisma.interviewSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        companyProfile: { not: null },
        evaluationStatus: 'COMPLETED',
        evaluation: { isNot: null },
      },
      include: {
        evaluation: true,
      },
    }),
  ]);

  const averageInterviewScore = Math.round(averageScoreData._avg.overallScore || 0);
  const totalStudyTime = (submissionsStudyTime._sum.timeSpent || 0) + (interviewsStudyTime._sum.durationSeconds || 0);

  // Determine strongest/weakest topics using weighted scores
  let strongestTopic: string | null = null;
  let weakestTopic: string | null = null;

  if (topicPerformance.length > 0) {
    // Sort by averageScore (which is weighted score) descending
    const sorted = [...topicPerformance].sort((a, b) => b.averageScore - a.averageScore);
    const completedTopics = sorted.filter(t => t.completionCount > 0);
    strongestTopic = completedTopics.length > 0 ? completedTopics[0].topic : 'N/A';
    weakestTopic = completedTopics.length > 0 ? completedTopics[completedTopics.length - 1].topic : 'N/A';
  }

  // Calculate company averages and aggregate JSON insights
  const companyStats: Record<string, {
    totalScore: number;
    count: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> = {};

  for (const session of companyInterviews) {
    const company = session.companyProfile!;
    const evaluation = session.evaluation!;
    if (evaluation.overallScore === null) continue;

    if (!companyStats[company]) {
      companyStats[company] = {
        totalScore: 0,
        count: 0,
        strengths: [],
        weaknesses: [],
        recommendations: [],
      };
    }

    const stats = companyStats[company];
    stats.totalScore += evaluation.overallScore;
    stats.count++;

    const raw = evaluation.rawResponse as any;
    if (raw) {
      if (Array.isArray(raw.companyStrengths)) {
        stats.strengths.push(...raw.companyStrengths);
      }
      if (Array.isArray(raw.companyWeaknesses)) {
        stats.weaknesses.push(...raw.companyWeaknesses);
      }
      if (Array.isArray(raw.companyRecommendations)) {
        stats.recommendations.push(...raw.companyRecommendations);
      }
    }
  }

  const companyReadiness: Record<string, {
    readinessScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> = {};

  let strongestCompanyProfile: string | null = null;
  let weakestCompanyProfile: string | null = null;
  let highestScore = -1;
  let lowestScore = 101;

  for (const [company, stats] of Object.entries(companyStats)) {
    const avgScore = Math.round(stats.totalScore / stats.count);
    const strengths = Array.from(new Set(stats.strengths)).slice(0, 5);
    const weaknesses = Array.from(new Set(stats.weaknesses)).slice(0, 5);
    const recommendations = Array.from(new Set(stats.recommendations)).slice(0, 5);

    companyReadiness[company] = {
      readinessScore: avgScore,
      strengths,
      weaknesses,
      recommendations,
    };

    if (avgScore > highestScore) {
      highestScore = avgScore;
      strongestCompanyProfile = company;
    }
    if (avgScore < lowestScore) {
      lowestScore = avgScore;
      weakestCompanyProfile = company;
    }
  }

  // Compute insights first so they can be saved in the database snapshot cache
  const insights = await computeInsights();

  // Recalculate coding analytics
  const codingSessions = await prisma.codingSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    include: {
      codingProblem: true,
      evaluation: true,
    },
  });

  const uniqueSolvedProblems = new Set(codingSessions.map(s => s.codingProblemId));
  const codingProblemsSolved = uniqueSolvedProblems.size;

  const evaluationsWithScore = codingSessions.filter(s => s.evaluation && s.evaluation.overallScore !== null);
  const totalCodingScore = evaluationsWithScore.reduce((sum, s) => sum + s.evaluation!.overallScore, 0);
  const averageCodingScore = evaluationsWithScore.length > 0 ? Math.round(totalCodingScore / evaluationsWithScore.length) : 0;

  // Language usage
  const languageUsage: Record<string, number> = {};
  codingSessions.forEach(s => {
    const lang = s.language.toLowerCase();
    languageUsage[lang] = (languageUsage[lang] || 0) + 1;
  });

  // Solved counts by difficulty
  let easySolvedCount = 0;
  let mediumSolvedCount = 0;
  let hardSolvedCount = 0;

  const solvedProblemsMap = new Map<string, any>();
  codingSessions.forEach(s => {
    solvedProblemsMap.set(s.codingProblemId, s.codingProblem);
  });

  solvedProblemsMap.forEach(prob => {
    if (prob.difficulty === 'EASY' || prob.difficulty === 'EASY_MEDIUM') {
      easySolvedCount++;
    } else if (prob.difficulty === 'MEDIUM') {
      mediumSolvedCount++;
    } else if (prob.difficulty === 'MEDIUM_HARD' || prob.difficulty === 'HARD') {
      hardSolvedCount++;
    }
  });

  // Success rate by difficulty
  const difficultyStats: Record<string, { total: number; passed: number }> = {
    easy: { total: 0, passed: 0 },
    medium: { total: 0, passed: 0 },
    hard: { total: 0, passed: 0 },
  };

  codingSessions.forEach(s => {
    let diffGroup = 'medium';
    if (s.difficulty === 'EASY' || s.difficulty === 'EASY_MEDIUM') {
      diffGroup = 'easy';
    } else if (s.difficulty === 'MEDIUM_HARD' || s.difficulty === 'HARD') {
      diffGroup = 'hard';
    }

    difficultyStats[diffGroup].total++;
    // success defined as correctnessScore >= 80 or executionFailed === 0
    if (s.evaluation && (s.evaluation.correctnessScore >= 80 || s.evaluation.executionFailed === 0)) {
      difficultyStats[diffGroup].passed++;
    }
  });

  const successRateByDifficulty: Record<string, number> = {
    easy: difficultyStats.easy.total > 0 ? Math.round((difficultyStats.easy.passed / difficultyStats.easy.total) * 100) : 0,
    medium: difficultyStats.medium.total > 0 ? Math.round((difficultyStats.medium.passed / difficultyStats.medium.total) * 100) : 0,
    hard: difficultyStats.hard.total > 0 ? Math.round((difficultyStats.hard.passed / difficultyStats.hard.total) * 100) : 0,
  };

  // Topic strengths and weaknesses
  const topicScores: Record<string, { total: number; count: number }> = {};
  evaluationsWithScore.forEach(s => {
    const topic = s.evaluation!.topic;
    if (!topicScores[topic]) {
      topicScores[topic] = { total: 0, count: 0 };
    }
    topicScores[topic].total += s.evaluation!.overallScore;
    topicScores[topic].count++;
  });

  const topicStrengths: string[] = [];
  const topicWeaknesses: string[] = [];

  Object.entries(topicScores).forEach(([topic, stats]) => {
    const avg = stats.total / stats.count;
    if (avg >= 75) {
      topicStrengths.push(topic);
    } else if (avg < 70) {
      topicWeaknesses.push(topic);
    }
  });

  const codingStats = {
    problemsSolved: codingProblemsSolved,
    averageCodingScore,
    languageUsage,
    topicStrengths,
    topicWeaknesses,
    easySolvedCount,
    mediumSolvedCount,
    hardSolvedCount,
    successRateByDifficulty,
  };

  // Update snapshot table using unique userId where clause (removes fallback ID)
  const newSnapshot = await prisma.analyticsSnapshot.upsert({
    where: { userId },
    update: {
      totalQuestionsSolved,
      totalInterviewsCompleted,
      averageInterviewScore,
      studyTimeSeconds: totalStudyTime,
      strongestTopic,
      weakestTopic,
      suggestedNextTopic: insights.suggestedNextTopic,
      recommendedFocusArea: insights.recommendedFocusArea,
      companyReadiness: companyReadiness as any,
      strongestCompanyProfile,
      weakestCompanyProfile,
      codingProblemsSolved,
      averageCodingScore,
      codingStats: codingStats as any,
      generatedAt: new Date(),
    },
    create: {
      userId,
      totalQuestionsSolved,
      totalInterviewsCompleted,
      averageInterviewScore,
      studyTimeSeconds: totalStudyTime,
      strongestTopic,
      weakestTopic,
      suggestedNextTopic: insights.suggestedNextTopic,
      recommendedFocusArea: insights.recommendedFocusArea,
      companyReadiness: companyReadiness as any,
      strongestCompanyProfile,
      weakestCompanyProfile,
      codingProblemsSolved,
      averageCodingScore,
      codingStats: codingStats as any,
    },
  });

  const latestResume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return {
    totalQuestionsSolved: newSnapshot.totalQuestionsSolved,
    totalInterviewsCompleted: newSnapshot.totalInterviewsCompleted,
    averageInterviewScore: newSnapshot.averageInterviewScore,
    totalStudyTime: newSnapshot.studyTimeSeconds,
    strongestTopic: newSnapshot.strongestTopic,
    weakestTopic: newSnapshot.weakestTopic,
    suggestedNextTopic: newSnapshot.suggestedNextTopic,
    recommendedFocusArea: newSnapshot.recommendedFocusArea,
    generatedAt: newSnapshot.generatedAt,
    resumeStrengthScore: latestResume ? (latestResume.insights as any)?.strengthScore : null,
    resumeMissingSkillsCount: latestResume ? (latestResume.insights as any)?.missingSkills?.length : null,
    resumeStrongestArea: latestResume ? (latestResume.insights as any)?.strongestAreas?.[0] : null,
    resumeWeakestArea: latestResume ? (latestResume.insights as any)?.weakestAreas?.[0] : null,
    resumeLearningRoadmap: latestResume ? (latestResume.insights as any)?.learningRoadmap : null,
    averageResumeAlignment,
    averageConsistencyScore,
    companyReadiness: newSnapshot.companyReadiness,
    strongestCompanyProfile: newSnapshot.strongestCompanyProfile,
    weakestCompanyProfile: newSnapshot.weakestCompanyProfile,
    codingProblemsSolved: newSnapshot.codingProblemsSolved,
    averageCodingScore: newSnapshot.averageCodingScore,
    codingStats: newSnapshot.codingStats,
  };
};

/**
 * Performance API: Returns daily trends for score, solved questions, and study duration.
 * Aggregated directly from database tables. Supports last 7, 30, and 90 days.
 */
export const getPerformanceAnalytics = async (
  userId: string,
  days = 7
): Promise<PerformanceAnalytics> => {
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - days + 1);
  startDate.setUTCHours(0, 0, 0, 0);

  // Fetch submissions completed within range
  const submissions = await prisma.submission.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      completedAt: { gte: startDate },
    },
    select: {
      completedAt: true,
      timeSpent: true,
    },
  });

  // Fetch completed interviews with evaluations completed within range
  const interviews = await prisma.interviewSession.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      durationSeconds: true,
      evaluation: {
        select: { overallScore: true, confidenceScore: true },
      },
    },
  });

  // Create date lookup map
  const trendMap: Record<
    string,
    {
      dateLabel: string;
      totalScore: number;
      scoreCount: number;
      questionsSolved: number;
      studyTimeSeconds: number;
      totalConfidence: number;
      confidenceCount: number;
    }
  > = {};

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().split('T')[0]; // YYYY-MM-DD in UTC
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); // e.g. "Jun 20"
    trendMap[key] = {
      dateLabel: label,
      totalScore: 0,
      scoreCount: 0,
      questionsSolved: 0,
      studyTimeSeconds: 0,
      totalConfidence: 0,
      confidenceCount: 0,
    };
  }

  // Populate submission solved counts and study times
  for (const sub of submissions) {
    if (sub.completedAt) {
      const key = new Date(sub.completedAt).toISOString().split('T')[0];
      if (trendMap[key]) {
        trendMap[key].questionsSolved++;
        trendMap[key].studyTimeSeconds += sub.timeSpent;
      }
    }
  }

  // Populate interview scores and study times
  for (const iv of interviews) {
    const key = new Date(iv.createdAt).toISOString().split('T')[0];
    if (trendMap[key]) {
      trendMap[key].studyTimeSeconds += iv.durationSeconds;
      if (iv.evaluation) {
        if (iv.evaluation.overallScore !== null) {
          trendMap[key].totalScore += iv.evaluation.overallScore;
          trendMap[key].scoreCount++;
        }
        if (iv.evaluation.confidenceScore !== null) {
          trendMap[key].totalConfidence += iv.evaluation.confidenceScore;
          trendMap[key].confidenceCount++;
        }
      }
    }
  }

  // Format map into chronological array
  return Object.keys(trendMap)
    .sort()
    .map((key) => {
      const item = trendMap[key];
      const avgScore = item.scoreCount > 0 ? Math.round(item.totalScore / item.scoreCount) : null;
      const avgConfidence = item.confidenceCount > 0 ? Math.round(item.totalConfidence / item.confidenceCount) : null;
      return {
        date: item.dateLabel,
        interviewScore: avgScore,
        questionsSolved: item.questionsSolved,
        studyTime: Math.round(item.studyTimeSeconds / 60), // in minutes
        confidenceScore: avgConfidence,
      };
    });
};

/**
 * Topics API: Aggregates completion, interview evaluation, and practice scores per topic.
 * Uses a weighted performance formula:
 * - 40% Completion Rate (completed submissions / total questions in topic)
 * - 40% Average Interview Score
 * - 20% Practice Activity Score (average submission score)
 */
export const getTopicAnalytics = async (userId: string): Promise<TopicAnalytics> => {
  // 1. Fetch total question counts per topic in DB to compute completion rate
  const questionsInTopic = await prisma.question.groupBy({
    by: ['topic'],
    _count: { id: true },
  });

  const totalQuestionsMap: Record<string, number> = {};
  for (const item of questionsInTopic) {
    totalQuestionsMap[item.topic] = item._count.id;
  }

  // 2. Fetch completed submissions grouped by question topic
  const submissions = await prisma.submission.findMany({
    where: { userId, status: 'COMPLETED' },
    select: {
      score: true,
      question: {
        select: { topic: true },
      },
    },
  });

  // 3. Fetch completed interview evaluations to inspect question-level scoring
  const interviewQuestions = await prisma.interviewQuestion.findMany({
    where: {
      interviewSession: {
        userId,
        status: 'COMPLETED',
        evaluationStatus: EvaluationStatus.COMPLETED,
      },
    },
    select: {
      questionText: true,
      interviewSession: {
        select: { domain: true },
      },
      answers: {
        select: {
          interviewQuestion: {
            select: {
              questionEvaluations: {
                select: { score: true },
              },
            },
          },
        },
      },
    },
  });

  // Initialize aggregates for the 9 target topics
  const statsMap: Record<
    string,
    {
      completedSubmissionsCount: number;
      totalPracticeScore: number;
      practiceScoreCount: number;
      totalInterviewScore: number;
      interviewScoreCount: number;
      successCount: number;
      totalEvaluatedCount: number;
    }
  > = {};

  for (const topic of TARGET_TOPICS) {
    statsMap[topic] = {
      completedSubmissionsCount: 0,
      totalPracticeScore: 0,
      practiceScoreCount: 0,
      totalInterviewScore: 0,
      interviewScoreCount: 0,
      successCount: 0,
      totalEvaluatedCount: 0,
    };
  }

  // Aggregate submissions data
  for (const sub of submissions) {
    const topic = sub.question.topic;
    if (statsMap[topic]) {
      statsMap[topic].completedSubmissionsCount++;
      if (sub.score !== null && sub.score !== undefined) {
        statsMap[topic].totalPracticeScore += sub.score;
        statsMap[topic].practiceScoreCount++;
        statsMap[topic].totalEvaluatedCount++;
        if (sub.score >= 60) {
          statsMap[topic].successCount++;
        }
      }
    }
  }

  // Aggregate interview question evaluations data
  for (const iq of interviewQuestions) {
    const topic = classifyQuestionTopic(iq.questionText, iq.interviewSession.domain);
    if (statsMap[topic]) {
      const scores = iq.answers.flatMap((ans) =>
        ans.interviewQuestion.questionEvaluations
          .map((qe) => qe.score)
          .filter((s): s is number => s !== null)
      );

      for (const score of scores) {
        statsMap[topic].totalInterviewScore += score;
        statsMap[topic].interviewScoreCount++;
        statsMap[topic].totalEvaluatedCount++;
        if (score >= 60) {
          statsMap[topic].successCount++;
        }
      }
    }
  }

  // Compute final weighted values per topic
  return TARGET_TOPICS.map((topic) => {
    const stats = statsMap[topic];
    const totalQuestions = totalQuestionsMap[topic] || 0;

    // 40% Completion Rate (completed submissions / total questions in topic)
    const completionRate = totalQuestions > 0 ? (stats.completedSubmissionsCount / totalQuestions) * 100 : 0;

    // 40% Average Interview Score
    const avgInterviewScore = stats.interviewScoreCount > 0 ? stats.totalInterviewScore / stats.interviewScoreCount : 0;

    // 20% Practice Activity Score (average submission score)
    const avgPracticeScore = stats.practiceScoreCount > 0 ? stats.totalPracticeScore / stats.practiceScoreCount : 0;

    // Calculate final weighted score
    const weightedScore = (0.4 * completionRate) + (0.4 * avgInterviewScore) + (0.2 * avgPracticeScore);

    // Calculate generic success percentage (items scored >= 60 / total evaluated items)
    const successPercentage = stats.totalEvaluatedCount > 0 
      ? Math.round((stats.successCount / stats.totalEvaluatedCount) * 100) 
      : 0;

    return {
      topic,
      completionCount: stats.completedSubmissionsCount,
      // Map averageScore to weightedScore (rounded) for consistent layout
      averageScore: Math.round(weightedScore),
      successPercentage,
    };
  });
};

/**
 * Skills API: normalized scores for Technical Accuracy, Communication, Clarity, and Depth.
 * Computed directly from all completed InterviewEvaluations.
 */
export const getSkillAnalytics = async (userId: string): Promise<SkillAnalytics> => {
  const averages = await prisma.interviewEvaluation.aggregate({
    where: {
      session: {
        userId,
        status: 'COMPLETED',
        evaluationStatus: EvaluationStatus.COMPLETED,
      },
    },
    _avg: {
      technicalAccuracy: true,
      communication: true,
      clarity: true,
      depth: true,
    },
  });

  return {
    technicalAccuracy: Math.round(averages._avg.technicalAccuracy || 0),
    communication: Math.round(averages._avg.communication || 0),
    clarity: Math.round(averages._avg.clarity || 0),
    depth: Math.round(averages._avg.depth || 0),
  };
};
