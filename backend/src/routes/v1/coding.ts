import { Router } from 'express';
import {
  getProblems,
  createSession,
  getSessionById,
  saveSessionCode,
  runSessionCode,
  submitSessionCode,
} from '@backend/controllers/coding.controller';
import { validate } from '@backend/validators/validate.middleware';
import {
  createCodingSessionSchema,
  getCodingSessionByIdSchema,
  saveCodeSchema,
  runCodeSchema,
  submitCodeSchema,
} from '@backend/validators/coding.validator';
import { authenticate } from '@backend/middlewares/auth';
import { codeExecutionRateLimiter } from '@backend/middlewares/rateLimiter';

const router = Router();

// Protect all coding session endpoints
router.use(authenticate);

router.get('/problems', getProblems);
router.post('/sessions', validate(createCodingSessionSchema), createSession);
router.get('/sessions/:id', validate(getCodingSessionByIdSchema), getSessionById);
router.patch('/sessions/:id/save', validate(saveCodeSchema), saveSessionCode);
router.post('/sessions/:id/run', codeExecutionRateLimiter, validate(runCodeSchema), runSessionCode);
router.post('/sessions/:id/submit', codeExecutionRateLimiter, validate(submitCodeSchema), submitSessionCode);

export default router;
