import { Router } from 'express';
import {
  getOverview,
  getPerformance,
  getTopics,
  getSkills,
} from '@backend/controllers/analytics.controller';
import { authenticate } from '@backend/middlewares/auth';

const router = Router();

// Protect all analytics endpoints
router.use(authenticate);

router.get('/overview', getOverview);
router.get('/performance', getPerformance);
router.get('/topics', getTopics);
router.get('/skills', getSkills);

export default router;
