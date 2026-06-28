import { prisma } from '@backend/config/db';
import { CodingSession, CodingSessionStatus, CodingEvaluation, CodingTopic, Difficulty, CodingExecution } from '@prisma/client';
import { getExecutionProvider } from './execution.service';
import * as geminiService from '@backend/services/ai/gemini.service';
import { BadRequestError, NotFoundError, ForbiddenError } from '@backend/utils/appError';
import { logger } from '@backend/config/logger';

export const getCodingProblems = async (): Promise<any[]> => {
  return prisma.codingProblem.findMany({
    orderBy: { createdAt: 'asc' },
  });
};

export const createCodingSession = async (
  userId: string,
  data: { codingProblemId: string; language: string; interviewSessionId?: string | null }
): Promise<CodingSession> => {
  const { codingProblemId, language, interviewSessionId } = data;

  const problem = await prisma.codingProblem.findUnique({
    where: { id: codingProblemId },
  });

  if (!problem) {
    throw new NotFoundError('Coding problem not found');
  }

  // Map language to starter code
  let starterCode = '';
  const lang = language.toLowerCase();
  if (lang === 'python' || lang === 'py') {
    starterCode = problem.starterCodePy;
  } else if (lang === 'javascript' || lang === 'js') {
    starterCode = problem.starterCodeJs;
  } else if (lang === 'java') {
    starterCode = problem.starterCodeJava;
  } else {
    throw new BadRequestError(`Unsupported language: ${language}`);
  }

  const title = `Coding Session: ${problem.title}`;

  return prisma.codingSession.create({
    data: {
      userId,
      codingProblemId,
      interviewSessionId: interviewSessionId || null,
      title,
      language,
      starterCode,
      userCode: starterCode,
      status: CodingSessionStatus.IN_PROGRESS,
      difficulty: problem.difficulty,
    },
  });
};

export const getCodingSessionById = async (id: string, userId: string): Promise<any> => {
  const session = await prisma.codingSession.findUnique({
    where: { id },
    include: {
      codingProblem: true,
      evaluation: true,
      executions: {
        orderBy: { createdAt: 'desc' },
        take: 10, // return latest 10 runs
      },
    },
  });

  if (!session) {
    throw new NotFoundError('Coding session not found');
  }

  if (session.userId !== userId) {
    throw new ForbiddenError('You do not have access to this coding session');
  }

  return session;
};

export const saveCode = async (id: string, userId: string, userCode: string): Promise<CodingSession> => {
  const session = await prisma.codingSession.findUnique({
    where: { id },
  });

  if (!session) {
    throw new NotFoundError('Coding session not found');
  }

  if (session.userId !== userId) {
    throw new ForbiddenError('You do not have access to this coding session');
  }

  if (session.status === CodingSessionStatus.COMPLETED) {
    throw new BadRequestError('Cannot edit code for a completed session');
  }

  return prisma.codingSession.update({
    where: { id },
    data: { userCode },
  });
};

export const runCode = async (
  id: string,
  userId: string,
  userCode: string
): Promise<{ success: boolean; stdout: string; stderr: string; compileError?: string; testResults: any[] }> => {
  const session = await prisma.codingSession.findUnique({
    where: { id },
    include: { codingProblem: true },
  });

  if (!session) {
    throw new NotFoundError('Coding session not found');
  }

  if (session.userId !== userId) {
    throw new ForbiddenError('You do not have access to this coding session');
  }

  // Update current code
  await prisma.codingSession.update({
    where: { id },
    data: { userCode },
  });

  const testCases = (session.codingProblem.testCases as any) || [];
  const provider = getExecutionProvider();

  // Execute standard test cases
  const result = await provider.runTests(userCode, session.language, testCases);
  const passedAll = result.testResults.every(r => r.passed);

  // Persist execution history in CodingExecution model
  try {
    await prisma.codingExecution.create({
      data: {
        codingSessionId: id,
        code: userCode,
        language: session.language,
        passed: passedAll,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        error: result.compileError || '',
        testResults: result.testResults as any,
      },
    });
  } catch (err: any) {
    logger.error(`⚠️ Failed to persist coding execution history: ${err.message}`);
  }

  return {
    success: result.success,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    compileError: result.compileError,
    testResults: result.testResults
  };
};

export const submitCode = async (
  id: string,
  userId: string,
  userCode: string
): Promise<any> => {
  const session = await prisma.codingSession.findUnique({
    where: { id },
    include: { codingProblem: true },
  });

  if (!session) {
    throw new NotFoundError('Coding session not found');
  }

  if (session.userId !== userId) {
    throw new ForbiddenError('You do not have access to this coding session');
  }

  if (session.status === CodingSessionStatus.COMPLETED) {
    throw new BadRequestError('Session already submitted');
  }

  const hiddenCases = (session.codingProblem.hiddenTestCases as any) || [];
  const provider = getExecutionProvider();

  // Run hidden test cases for final correctness validation
  const result = await provider.runTests(userCode, session.language, hiddenCases);

  const passedCount = result.testResults.filter(r => r.passed).length;
  const failedCount = hiddenCases.length - passedCount;

  // Complete session and save execution result
  const updatedSession = await prisma.codingSession.update({
    where: { id },
    data: {
      status: CodingSessionStatus.COMPLETED,
      userCode,
      executionResult: result as any,
    },
  });

  // Execute evaluation synchronously or queue
  let evaluation: any;
  try {
    evaluation = await evaluateCodingSession(id, userId, passedCount, failedCount);
  } catch (evalErr: any) {
    logger.error(`💥 AI Code Review failed: ${evalErr.message}. Generating fallback.`);
    // Safe offline fallback
    evaluation = await evaluateCodingSessionOffline(id, userId, passedCount, failedCount);
  }

  return {
    session: updatedSession,
    evaluation,
  };
};

export const evaluateCodingSession = async (
  sessionId: string,
  userId: string,
  passedCount: number,
  failedCount: number
): Promise<CodingEvaluation> => {
  const session = await prisma.codingSession.findUnique({
    where: { id: sessionId },
    include: { codingProblem: true },
  });

  if (!session) {
    throw new NotFoundError('Coding session not found');
  }

  const correctnessRatio = (passedCount / (passedCount + failedCount || 1));
  const correctnessScore = Math.round(correctnessRatio * 100);

  // Trigger Gemini Code Review
  let review: any;
  try {
    review = await geminiService.evaluateCodingSession(
      session.codingProblem.title,
      session.codingProblem.description,
      session.language,
      session.userCode,
      correctnessScore
    );
  } catch (err: any) {
    logger.warn(`⚠️ Gemini Review failed: ${err.message}. Using offline static analysis.`);
    // Fall back to offline analysis
    review = await geminiService.evaluateCodingSessionOffline(
      session.userCode,
      session.language,
      correctnessScore
    );
  }

  const overallScore = Math.round(
    (review.correctnessScore * 0.4) +
    (review.codeQualityScore * 0.3) +
    (review.complexityScore * 0.15) +
    (review.optimizationScore * 0.15)
  );

  const evaluation = await prisma.codingEvaluation.create({
    data: {
      codingSessionId: sessionId,
      correctnessScore: review.correctnessScore,
      codeQualityScore: review.codeQualityScore,
      complexityScore: review.complexityScore,
      optimizationScore: review.optimizationScore,
      overallScore,
      topic: session.codingProblem.topic,
      similarityScore: review.similarityScore || 0,
      executionPassed: passedCount,
      executionFailed: failedCount,
      strengths: review.strengths,
      weaknesses: review.weaknesses,
      recommendations: review.recommendations,
    },
  });

  // Recompute user overview analytics cache
  try {
    const { getAnalyticsOverview } = require('@backend/services/analytics.service');
    await getAnalyticsOverview(userId, true);
  } catch (err: any) {
    logger.error(`⚠️ Failed to update analytics snapshot: ${err.message}`);
  }

  return evaluation;
};

// Generates evaluation using local static code analyzer
export const evaluateCodingSessionOffline = async (
  sessionId: string,
  userId: string,
  passedCount: number,
  failedCount: number
): Promise<CodingEvaluation> => {
  const session = await prisma.codingSession.findUnique({
    where: { id: sessionId },
    include: { codingProblem: true },
  });

  if (!session) {
    throw new NotFoundError('Coding session not found');
  }

  const correctnessRatio = (passedCount / (passedCount + failedCount || 1));
  const correctnessScore = Math.round(correctnessRatio * 100);

  const review = await geminiService.evaluateCodingSessionOffline(
    session.userCode,
    session.language,
    correctnessScore
  );

  const overallScore = Math.round(
    (review.correctnessScore * 0.4) +
    (review.codeQualityScore * 0.3) +
    (review.complexityScore * 0.15) +
    (review.optimizationScore * 0.15)
  );

  return prisma.codingEvaluation.create({
    data: {
      codingSessionId: sessionId,
      correctnessScore: review.correctnessScore,
      codeQualityScore: review.codeQualityScore,
      complexityScore: review.complexityScore,
      optimizationScore: review.optimizationScore,
      overallScore,
      topic: session.codingProblem.topic,
      similarityScore: review.similarityScore || 0,
      executionPassed: passedCount,
      executionFailed: failedCount,
      strengths: review.strengths,
      weaknesses: review.weaknesses,
      recommendations: review.recommendations,
    },
  });
};
