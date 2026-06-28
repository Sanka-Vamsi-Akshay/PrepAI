import { prisma } from '@backend/config/db';
import { InterviewSession, InterviewSessionStatus, InterviewDomain, Difficulty, InterviewQuestion, EvaluationStatus, InterviewType, CompanyProfile } from '@prisma/client';
import * as geminiService from '@backend/services/ai/gemini.service';
import * as evaluationService from '@backend/services/evaluation.service';
import { BadRequestError, NotFoundError, ForbiddenError } from '@backend/utils/appError';

interface PaginatedSessionsResult {
  sessions: InterviewSession[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const createInterviewSession = async (
  userId: string,
  data: { domain: InterviewDomain; difficulty: Difficulty; interviewType?: InterviewType; resumeId?: string | null; companyProfile?: CompanyProfile | null }
): Promise<InterviewSession & { questions: InterviewQuestion[] }> => {
  const { domain, difficulty, interviewType = InterviewType.STANDARD, resumeId, companyProfile } = data;

  let questionTexts: string[] = [];
  let fetchedResume: any = null;

  if (interviewType === InterviewType.PERSONALIZED) {
    if (!resumeId) {
      throw new BadRequestError('resumeId is required for personalized interviews.');
    }

    // Resume ownership and existence validation
    fetchedResume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!fetchedResume) {
      throw new NotFoundError('Selected resume not found.');
    }

    if (fetchedResume.userId !== userId) {
      throw new ForbiddenError('You do not have permission to use this resume.');
    }

    questionTexts = await geminiService.generatePersonalizedQuestions(
      fetchedResume.extractedText,
      fetchedResume.parsedData,
      domain,
      difficulty,
      companyProfile
    );
  } else {
    questionTexts = await geminiService.generateQuestions(domain, difficulty, companyProfile);
  }

  let title = interviewType === InterviewType.PERSONALIZED
    ? `Personalised ${domain.replace('_', ' ')} Run (${difficulty})`
    : `${domain.replace('_', ' ')} Simulator (${difficulty})`;

  if (companyProfile) {
    title = interviewType === InterviewType.PERSONALIZED
      ? `${companyProfile} - Personalised ${domain.replace('_', ' ')} (${difficulty})`
      : `${companyProfile} - ${domain.replace('_', ' ')} Simulator (${difficulty})`;
  }

  // 2. Write interview session and questions inside a database transaction
  const session = await prisma.$transaction(async (tx) => {
    const newSession = await tx.interviewSession.create({
      data: {
        userId,
        title,
        domain,
        difficulty,
        status: InterviewSessionStatus.IN_PROGRESS, // Boot straight to active simulation
        durationSeconds: 0,
        questionCount: questionTexts.length,
        promptVersion: interviewType === InterviewType.PERSONALIZED 
          ? (companyProfile ? 'personalized-company-v1' : 'personalized-v1') 
          : (companyProfile ? 'company-v1' : 'v1'),
        interviewType,
        resumeId: interviewType === InterviewType.PERSONALIZED ? resumeId : null,
        companyProfile: companyProfile || null,
      },
    });

    const questionsData = questionTexts.map((text, idx) => ({
      interviewSessionId: newSession.id,
      questionText: text,
      order: idx,
    }));

    await tx.interviewQuestion.createMany({
      data: questionsData,
    });

    const createdQuestions = await tx.interviewQuestion.findMany({
      where: { interviewSessionId: newSession.id },
      orderBy: { order: 'asc' },
    });

    return {
      ...newSession,
      questions: createdQuestions,
    };
  });

  return session;
};

export const getInterviewSessions = async (
  userId: string,
  query: { page?: number; limit?: number }
): Promise<PaginatedSessionsResult> => {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const [total, sessions] = await Promise.all([
    prisma.interviewSession.count({ where: { userId } }),
    prisma.interviewSession.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    sessions,
    metadata: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getInterviewSessionById = async (
  id: string,
  userId: string
): Promise<any> => {
  const session = await prisma.interviewSession.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
      answers: true,
    },
  });

  if (!session) {
    throw new NotFoundError('Interview session not found');
  }

  // Ownership verification
  if (session.userId !== userId) {
    throw new ForbiddenError('You do not have access to this interview session');
  }

  return session;
};

export const submitAnswer = async (
  id: string,
  questionId: string,
  userId: string,
  userAnswer: string
): Promise<any> => {
  return prisma.$transaction(async (tx) => {
    // Acquire a row-level lock on the session to serialize concurrent submissions and prevent answeredCount race conditions
    await tx.$executeRaw`SELECT 1 FROM "interview_sessions" WHERE "id" = ${id} FOR UPDATE`;

    // 1. Verify session exists and belongs to user
    const session = await tx.interviewSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundError('Interview session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenError('You do not have access to this interview session');
    }

    if (session.status === InterviewSessionStatus.COMPLETED) {
      throw new BadRequestError('Cannot submit answers to a completed interview session');
    }

    // 2. Verify question belongs to this session
    const question = await tx.interviewQuestion.findFirst({
      where: { id: questionId, interviewSessionId: id },
    });

    if (!question) {
      throw new BadRequestError('Question does not belong to this interview session');
    }

    // 3. Increment answeredCount if this is a first-time response to the question
    const existingAnswer = await tx.interviewAnswer.findUnique({
      where: {
        interviewSessionId_interviewQuestionId: {
          interviewSessionId: id,
          interviewQuestionId: questionId,
        },
      },
    });

    if (!existingAnswer) {
      await tx.interviewSession.update({
        where: { id },
        data: { answeredCount: { increment: 1 } },
      });
    }

    // 4. Upsert answer incrementally (unique key ensures single row per question)
    const answer = await tx.interviewAnswer.upsert({
      where: {
        interviewSessionId_interviewQuestionId: {
          interviewSessionId: id,
          interviewQuestionId: questionId,
        },
      },
      update: {
        userAnswer,
      },
      create: {
        interviewSessionId: id,
        interviewQuestionId: questionId,
        userAnswer,
      },
    });

    return answer;
  });
};

export const endInterviewSession = async (
  id: string,
  userId: string,
  durationSeconds?: number
): Promise<InterviewSession> => {
  const session = await prisma.interviewSession.findUnique({
    where: { id },
  });

  if (!session) {
    throw new NotFoundError('Interview session not found');
  }

  if (session.userId !== userId) {
    throw new ForbiddenError('You do not have permission to modify this session');
  }

  const updatedSession = await prisma.interviewSession.update({
    where: { id },
    data: {
      status: InterviewSessionStatus.COMPLETED,
      ...(durationSeconds !== undefined && { durationSeconds }),
    },
  });

  // Trigger evaluation in the background asynchronously
  await evaluationService.queueEvaluationJob(id);

  return updatedSession;
};

export const getInterviewEvaluation = async (
  id: string,
  userId: string
): Promise<any> => {
  const session = await prisma.interviewSession.findUnique({
    where: { id },
  });

  if (!session) {
    throw new NotFoundError('Interview session not found');
  }

  if (session.userId !== userId) {
    throw new ForbiddenError('You do not have access to this interview session');
  }

  const [job, evaluation] = await Promise.all([
    prisma.evaluationJob.findUnique({
      where: { interviewSessionId: id },
    }),
    prisma.interviewEvaluation.findUnique({
      where: { interviewSessionId: id },
      include: {
        questionEvaluations: {
          orderBy: {
            interviewQuestion: {
              order: 'asc'
            }
          }
        }
      }
    }),
  ]);

  // Compute timeline metadata
  const timeline = job ? {
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    durationMs: (job.startedAt && job.completedAt) 
      ? new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime() 
      : null,
  } : null;

  return {
    status: session.evaluationStatus,
    job: job ? {
      status: job.status,
      retryCount: job.retryCount,
      errorMessage: job.errorMessage,
    } : null,
    evaluation,
    timeline,
  };
};

export const retryInterviewEvaluation = async (
  id: string,
  userId: string
): Promise<any> => {
  const session = await prisma.interviewSession.findUnique({
    where: { id },
  });

  if (!session) {
    throw new NotFoundError('Interview session not found');
  }

  if (session.userId !== userId) {
    throw new ForbiddenError('You do not have access to this interview session');
  }

  if (session.status !== InterviewSessionStatus.COMPLETED) {
    throw new BadRequestError('Cannot evaluate an incomplete interview session');
  }

  // Trigger retry (resetting the job)
  await evaluationService.queueEvaluationJob(id);

  return {
    status: EvaluationStatus.PENDING,
  };
};

export const quickStartSession = async (userId: string): Promise<InterviewSession> => {
  // 1. Fetch user's completed submissions
  const completedSubmissions = await prisma.submission.findMany({
    where: {
      userId,
      status: 'COMPLETED',
    },
    select: {
      questionId: true,
      completedAt: true,
    },
    orderBy: {
      completedAt: 'desc',
    },
  });

  const completedQuestionIds = completedSubmissions.map((s) => s.questionId);

  // 2. Fetch all available bank questions
  const allQuestions = await prisma.question.findMany({
    select: {
      id: true,
      title: true,
      category: true,
      difficulty: true,
    },
  });

  if (allQuestions.length === 0) {
    throw new NotFoundError('No questions found in the Question Bank');
  }

  // 3. Selection algorithm: prefer unanswered, then avoid recently completed
  const completedSet = new Set(completedQuestionIds);
  const unanswered = allQuestions.filter((q) => !completedSet.has(q.id));

  let selectedQuestion;
  if (unanswered.length > 0) {
    selectedQuestion = unanswered[Math.floor(Math.random() * unanswered.length)];
  } else {
    // Fallback: choose the least recently completed question
    const leastRecent = completedSubmissions[completedSubmissions.length - 1];
    selectedQuestion = allQuestions.find((q) => q.id === leastRecent.questionId) || allQuestions[0];
  }

  const fullQuestion = await prisma.question.findUnique({
    where: { id: selectedQuestion.id },
  });

  if (!fullQuestion) {
    throw new NotFoundError('Selected question details not found');
  }

  // 4. Map category to InterviewDomain enum
  let domain: InterviewDomain = InterviewDomain.DSA;
  const categoryUpper = fullQuestion.category.toUpperCase().replace(' ', '_');
  if (Object.values(InterviewDomain).includes(categoryUpper as any)) {
    domain = categoryUpper as InterviewDomain;
  }

  // 5. Create interview session and single interview question inside a transaction
  return prisma.$transaction(async (tx) => {
    const newSession = await tx.interviewSession.create({
      data: {
        userId,
        title: `Quick Run: ${fullQuestion.title}`,
        domain,
        difficulty: fullQuestion.difficulty,
        status: InterviewSessionStatus.IN_PROGRESS,
        durationSeconds: 0,
        questionCount: 1,
        promptVersion: 'v1.1',
      },
    });

    await tx.interviewQuestion.create({
      data: {
        interviewSessionId: newSession.id,
        questionText: `${fullQuestion.title}\n\nDescription:\n${fullQuestion.description}`,
        order: 0,
      },
    });

    return newSession;
  });
};
