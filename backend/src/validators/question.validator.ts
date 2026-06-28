import { z } from 'zod';
import { Difficulty } from '@prisma/client';

export const getQuestionsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    category: z.string().optional(),
    topic: z.string().optional(),
    bookmarked: z.string().optional(),
  }),
});

export const getQuestionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid question ID format'),
  }),
});

export type GetQuestionsQueryInput = z.infer<typeof getQuestionsQuerySchema>['query'];
