import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import questionsRouter from './questions';
import submissionsRouter from './submissions';
import interviewsRouter from './interviews';
import analyticsRouter from './analytics';
import bookmarkRouter from './bookmark';
import notificationRouter from './notification';
import resumeRouter from './resume';
import codingRouter from './coding';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/questions', questionsRouter);
router.use('/submissions', submissionsRouter);
router.use('/interviews', interviewsRouter);
router.use('/analytics', analyticsRouter);
router.use('/bookmarks', bookmarkRouter);
router.use('/notifications', notificationRouter);
router.use('/resumes', resumeRouter);
router.use('/coding', codingRouter);

export default router;
