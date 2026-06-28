import { Router } from 'express';
import {
  createInterviewSession,
  getInterviewSessions,
  getInterviewSessionById,
  submitAnswer,
  endInterviewSession,
  getInterviewEvaluation,
  retryInterviewEvaluation,
  quickStartSession,
} from '@backend/controllers/interview.controller';
import { validate } from '@backend/validators/validate.middleware';
import {
  createInterviewSchema,
  getInterviewsQuerySchema,
  getInterviewByIdSchema,
  submitAnswerSchema,
  endInterviewSchema,
} from '@backend/validators/interview.validator';
import { authenticate } from '@backend/middlewares/auth';
import { evaluationRetryRateLimiter, aiIntensiveRateLimiter } from '@backend/middlewares/rateLimiter';

const router = Router();

// Protect all interview session endpoints
router.use(authenticate);

router.post('/quick-start', aiIntensiveRateLimiter, quickStartSession);
router.post('/', aiIntensiveRateLimiter, validate(createInterviewSchema), createInterviewSession);
router.get('/', validate(getInterviewsQuerySchema), getInterviewSessions);
router.get('/:id', validate(getInterviewByIdSchema), getInterviewSessionById);
router.patch('/:id/questions/:questionId/answer', validate(submitAnswerSchema), submitAnswer);
router.patch('/:id/end', validate(endInterviewSchema), endInterviewSession);
router.get('/:id/evaluation', validate(getInterviewByIdSchema), getInterviewEvaluation);
router.post('/:id/evaluation/retry', evaluationRetryRateLimiter, validate(getInterviewByIdSchema), retryInterviewEvaluation);

export default router;
