import { prisma } from '@backend/config/db';
import { Submission, SubmissionStatus } from '@prisma/client';
import { BadRequestError, NotFoundError, ForbiddenError } from '@backend/utils/appError';
import { CreateSubmissionInput, UpdateSubmissionInput, GetSubmissionsQueryInput } from '@backend/validators/submission.validator';

interface PaginatedSubmissionsResult {
  submissions: any[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const createSubmission = async (
  userId: string,
  data: CreateSubmissionInput
): Promise<Submission> => {
  const { questionId, status = SubmissionStatus.IN_PROGRESS } = data;

  // 1. Verify that the target question exists
  const questionExists = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!questionExists) {
    throw new NotFoundError('Question not found');
  }

  // 2. Check for duplicate submissions (unique userId & questionId constraint)
  const existingSubmission = await prisma.submission.findUnique({
    where: {
      userId_questionId: {
        userId,
        questionId,
      },
    },
  });

  if (existingSubmission) {
    throw new BadRequestError('Submission for this question already exists');
  }

  // 3. Create submission
  const submission = await prisma.submission.create({
    data: {
      userId,
      questionId,
      status,
      timeSpent: 0,
      attemptCount: 1,
    },
    include: {
      question: {
        select: {
          title: true,
          difficulty: true,
          topic: true,
        },
      },
    },
  });

  return submission;
};

export const getSubmissions = async (
  userId: string,
  query: GetSubmissionsQueryInput
): Promise<PaginatedSubmissionsResult> => {
  const { page = 1, limit = 10, status, topic } = query;
  const skip = (page - 1) * limit;

  // Filter conditions
  const where: any = {
    userId, // Restrict to authenticated user
  };

  if (status) {
    where.status = status;
  }

  if (topic) {
    where.question = {
      topic: { equals: topic, mode: 'insensitive' },
    };
  }

  // Concurrently count total matchings and pull data
  const [total, submissions] = await Promise.all([
    prisma.submission.count({ where }),
    prisma.submission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        question: {
          select: {
            title: true,
            difficulty: true,
            topic: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    submissions,
    metadata: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getSubmissionById = async (
  id: string,
  userId: string
): Promise<any> => {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      question: {
        select: {
          title: true,
          difficulty: true,
          topic: true,
          description: true,
        },
      },
    },
  });

  if (!submission) {
    throw new NotFoundError('Submission not found');
  }

  // Verify ownership
  if (submission.userId !== userId) {
    throw new ForbiddenError('You do not have access to this submission');
  }

  return submission;
};

export const updateSubmission = async (
  id: string,
  userId: string,
  data: UpdateSubmissionInput
): Promise<Submission> => {
  const submission = await prisma.submission.findUnique({
    where: { id },
  });

  if (!submission) {
    throw new NotFoundError('Submission not found');
  }

  // Verify ownership
  if (submission.userId !== userId) {
    throw new ForbiddenError('You do not have permission to modify this submission');
  }

  const updateData: any = { ...data };

  // Auto-populate completedAt when status transitions to COMPLETED
  if (data.status) {
    if (data.status === SubmissionStatus.COMPLETED) {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null; // Clear if transitioned back
    }
  }

  const updated = await prisma.submission.update({
    where: { id },
    data: updateData,
    include: {
      question: {
        select: {
          title: true,
          difficulty: true,
          topic: true,
        },
      },
    },
  });

  return updated;
};
