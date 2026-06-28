import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '@backend/controllers/notification.controller';
import { authenticate } from '@backend/middlewares/auth';

const router = Router();

// Protect all notification routes
router.use(authenticate);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
