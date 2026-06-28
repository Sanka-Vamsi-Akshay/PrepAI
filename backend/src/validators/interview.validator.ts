import { z } from 'zod';
import { InterviewDomain, Difficulty, InterviewType, CompanyProfile } from '@prisma/client';

export const createInterviewSchema = z.object({
  body: z.object({
    domain: z.nativeEnum(InterviewDomain, {
      errorMap: () => ({ message: 'Invalid Interview Domain selected' }),
    }),
    difficulty: z.nativeEnum(Difficulty, {
      errorMap: () => ({ message: 'Invalid Difficulty level selected' }),
    }),
    interviewType: z.nativeEnum(InterviewType).optional(),
    resumeId: z.string().uuid().optional().nullable(),
    companyProfile: z.nativeEnum(CompanyProfile).optional().nullable(),
  }),
});

export const submitAnswerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid interview session ID format'),
    questionId: z.string().uuid('Invalid question ID format'),
  }),
  body: z.object({
    userAnswer: z.string({ required_error: 'userAnswer is required' }).min(1, 'Answer cannot be empty'),
  }),
});

export const getInterviewsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});

export const getInterviewByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid interview session ID format'),
  }),
});

export const endInterviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid interview session ID format'),
  }),
  body: z.object({
    durationSeconds: z.coerce.number().int().min(0).optional(),
  }),
});
