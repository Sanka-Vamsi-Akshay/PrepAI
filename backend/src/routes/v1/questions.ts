import { Router } from 'express';
import { getQuestions, getQuestionById } from '@backend/controllers/question.controller';
import { validate } from '@backend/validators/validate.middleware';
import { getQuestionsQuerySchema, getQuestionByIdSchema } from '@backend/validators/question.validator';
import { authenticate } from '@backend/middlewares/auth';

const router = Router();

// Protect all questions routes
router.use(authenticate);

router.get('/', validate(getQuestionsQuerySchema), getQuestions);
router.get('/:id', validate(getQuestionByIdSchema), getQuestionById);

export default router;
