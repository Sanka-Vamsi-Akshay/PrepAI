import { Router } from 'express';
import { toggleBookmark, getBookmarkedQuestions } from '@backend/controllers/bookmark.controller';
import { authenticate } from '@backend/middlewares/auth';

const router = Router();

// Protect all bookmark routes
router.use(authenticate);

router.post('/toggle', toggleBookmark);
router.get('/', getBookmarkedQuestions);

export default router;
