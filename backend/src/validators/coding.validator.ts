import { z } from 'zod';

export const createCodingSessionSchema = z.object({
  body: z.object({
    codingProblemId: z.string().uuid('Invalid coding problem ID format'),
    language: z.string().min(1, 'Language is required'),
    interviewSessionId: z.string().uuid().optional().nullable(),
  }),
});

export const saveCodeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid coding session ID format'),
  }),
  body: z.object({
    userCode: z.string({ required_error: 'userCode is required' }),
  }),
});

export const runCodeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid coding session ID format'),
  }),
  body: z.object({
    userCode: z.string({ required_error: 'userCode is required' }),
  }),
});

export const submitCodeSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid coding session ID format'),
  }),
  body: z.object({
    userCode: z.string({ required_error: 'userCode is required' }),
  }),
});

export const getCodingSessionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid coding session ID format'),
  }),
});
