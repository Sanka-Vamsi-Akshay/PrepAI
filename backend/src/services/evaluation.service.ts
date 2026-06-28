import { prisma } from '@backend/config/db';
import { EvaluationStatus, InterviewSessionStatus } from '@prisma/client';
import { logger } from '@backend/config/logger';
import * as geminiService from '@backend/services/ai/gemini.service';
import { enqueueEvaluationJob } from '@backend/queues/evaluation.queue';
import { createNotification } from '@backend/services/notification.service';
import { sendEvaluationCompletedEmail } from '@backend/utils/email';

/**
 * Trigger or queue an evaluation job for a completed session.
 * Prevents duplicate PENDING execution paths using database transactions.
 */
export const queueEvaluationJob = async (sessionId: string): Promise<any> => {
  // 1. Transactional check and status update to guarantee idempotency
  const job = await prisma.$transaction(async (tx) => {
    const existingJob = await tx.evaluationJob.findUnique({
      where: { interviewSessionId: sessionId },
    });

    if (existingJob && (existingJob.status === EvaluationStatus.PENDING || existingJob.status === EvaluationStatus.COMPLETED)) {
      logger.info(`🤖 Job already exists in state ${existingJob.status} for session ${sessionId}. Skipping duplicate request.`);
      return existingJob;
    }

    // Initialize or reset the job status to PENDING
    return tx.evaluationJob.upsert({
      where: { interviewSessionId: sessionId },
      update: {
        status: EvaluationStatus.PENDING,
        startedAt: new Date(),
        completedAt: null,
        errorMessage: null,
      },
      create: {
        interviewSessionId: sessionId,
        status: EvaluationStatus.PENDING,
        startedAt: new Date(),
      },
    });
  });

  // If the job in database is already COMPLETED, return early
  if (job.status === EvaluationStatus.COMPLETED) {
    return { success: true, status: job.status, enqueued: false };
  }

  // 2. Try enqueueing to BullMQ
  try {
    const result = await enqueueEvaluationJob(sessionId);

    // Update session evaluation status to PENDING
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { evaluationStatus: EvaluationStatus.PENDING },
    });

    return { success: true, dbJob: job, queueResult: result };
  } catch (error: any) {
    logger.error(`💥 Failed to enqueue evaluation job in BullMQ: ${error.message}. Reverting database status.`);
    
    // Revert status to FAILED in database so it can be retried
    await prisma.$transaction([
      prisma.evaluationJob.update({
        where: { interviewSessionId: sessionId },
        data: {
          status: EvaluationStatus.FAILED,
          errorMessage: `Queue error: ${error.message}`,
        },
      }),
      prisma.interviewSession.update({
        where: { id: sessionId },
        data: { evaluationStatus: EvaluationStatus.FAILED },
      }),
    ]);
    
    throw new Error(`Evaluation queuing failed: ${error.message}`);
  }
};

/**
 * Core processing runner called by BullMQ worker.
 * Bubbles up exceptions to allow BullMQ to handle job retries.
 */
export const processEvaluationJob = async (sessionId: string): Promise<void> => {
  logger.info(`🤖 Running evaluation for session ${sessionId}...`);

  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: { orderBy: { order: 'asc' } },
      answers: true,
      user: true,
    },
  });

  if (!session) {
    throw new Error(`Interview session not found: ${sessionId}`);
  }

  if (session.status !== InterviewSessionStatus.COMPLETED) {
    throw new Error(`Cannot evaluate session ${sessionId} because it is not COMPLETED`);
  }

  // Format transcripts
  const transcript: geminiService.TranscriptItem[] = session.questions.map((q) => {
    const ans = session.answers.find((a) => a.interviewQuestionId === q.id);
    return {
      id: q.id,
      questionText: q.questionText,
      userAnswer: ans ? ans.userAnswer : '',
    };
  });

  // 60 seconds timeout promise
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Evaluation worker timeout (60s exceeded)')), 60000)
  );

  // Call Gemini API raced against timeout
  let evaluationResult: any;
  if (session.interviewType === 'PERSONALIZED' && session.resumeId) {
    const resume = await prisma.resume.findUnique({
      where: { id: session.resumeId },
    });
    if (!resume) {
      throw new Error(`Resume not found for personalized session ${sessionId}`);
    }
    evaluationResult = await Promise.race([
      geminiService.evaluatePersonalizedInterview(session.domain, session.difficulty, transcript, resume.extractedText, resume.parsedData, session.companyProfile),
      timeoutPromise,
    ]);
  } else {
    evaluationResult = await Promise.race([
      geminiService.evaluateSession(session.domain, session.difficulty, transcript, session.companyProfile),
      timeoutPromise,
    ]);
  }

  // Save results inside a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Create or update InterviewEvaluation
    const evaluation = await tx.interviewEvaluation.upsert({
      where: { interviewSessionId: sessionId },
      update: {
        overallScore: evaluationResult.overallScore,
        technicalAccuracy: evaluationResult.technicalAccuracy,
        communication: evaluationResult.communication,
        clarity: evaluationResult.clarity,
        depth: evaluationResult.depth,
        resumeAlignmentScore: evaluationResult.resumeAlignmentScore ?? null,
        consistencyScore: evaluationResult.consistencyScore ?? null,
        confidenceScore: evaluationResult.confidenceScore ?? null,
        strengths: evaluationResult.strengths,
        weaknesses: evaluationResult.weaknesses,
        recommendations: evaluationResult.recommendations,
        rawResponse: evaluationResult as any,
      },
      create: {
        interviewSessionId: sessionId,
        overallScore: evaluationResult.overallScore,
        technicalAccuracy: evaluationResult.technicalAccuracy,
        communication: evaluationResult.communication,
        clarity: evaluationResult.clarity,
        depth: evaluationResult.depth,
        resumeAlignmentScore: evaluationResult.resumeAlignmentScore ?? null,
        consistencyScore: evaluationResult.consistencyScore ?? null,
        confidenceScore: evaluationResult.confidenceScore ?? null,
        strengths: evaluationResult.strengths,
        weaknesses: evaluationResult.weaknesses,
        recommendations: evaluationResult.recommendations,
        rawResponse: evaluationResult as any,
      },
    });

    // 2. Create/update individual QuestionEvaluations
    for (const qEval of evaluationResult.questionEvaluations) {
      await tx.questionEvaluation.upsert({
        where: {
          interviewEvaluationId_interviewQuestionId: {
            interviewEvaluationId: evaluation.id,
            interviewQuestionId: qEval.questionId,
          },
        },
        update: {
          score: qEval.score,
          feedback: qEval.feedback,
        },
        create: {
          interviewEvaluationId: evaluation.id,
          interviewQuestionId: qEval.questionId,
          score: qEval.score,
          feedback: qEval.feedback,
        },
      });
    }

    // 3. Update session evaluation status
    await tx.interviewSession.update({
      where: { id: sessionId },
      data: { evaluationStatus: EvaluationStatus.COMPLETED },
    });

    // 4. Update job record
    await tx.evaluationJob.update({
      where: { interviewSessionId: sessionId },
      data: {
        status: EvaluationStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  });

  // Trigger user alerts asynchronously (outside transaction lock)
  try {
    await createNotification(
      session.userId,
      'Evaluation Completed',
      `Your mock interview session "${session.title}" has been successfully evaluated.`,
      'EVALUATION_COMPLETED',
      `/interviews/${sessionId}`
    );

    await sendEvaluationCompletedEmail(
      session.user.email,
      session.user.name || 'Candidate',
      session.title,
      sessionId
    );
  } catch (notifErr: any) {
    logger.error(`⚠️ Failed to trigger evaluation completion alerts: ${notifErr.message}`);
  }

  logger.info(`✅ Background evaluation completed for session ${sessionId}`);
};
