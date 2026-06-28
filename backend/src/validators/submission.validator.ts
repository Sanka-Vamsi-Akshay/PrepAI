import { z } from 'zod';
import { SubmissionStatus } from '@prisma/client';

export const createSubmissionSchema = z.object({
  body: z.object({
    questionId: z.string({ required_error: 'questionId is required' }).uuid('Invalid question ID format'),
    status: z.nativeEnum(SubmissionStatus).optional().default(SubmissionStatus.IN_PROGRESS),
  }),
});

export const updateSubmissionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid submission ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(SubmissionStatus).optional(),
    notes: z
      .string()
      .max(5000, 'Notes cannot exceed 5000 characters')
      .optional()
      .nullable(),
    timeSpent: z.coerce.number().int().min(0).optional(),
    attemptCount: z.coerce.number().int().min(1).optional(),
    reflection: z.string().optional().nullable(),
  }),
});

export const getSubmissionsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.nativeEnum(SubmissionStatus).optional(),
    topic: z.string().optional(),
  }),
});

export const getSubmissionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid submission ID format'),
  }),
});

export type GetSubmissionsQueryInput = z.infer<typeof getSubmissionsQuerySchema>['query'];
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>['body'];
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>['body'];
