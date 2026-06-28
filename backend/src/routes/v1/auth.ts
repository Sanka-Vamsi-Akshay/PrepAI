import { Router } from 'express';
import { login, register, logout, me, bootstrap } from '@backend/controllers/auth.controller';
import { authRateLimiter } from '@backend/middlewares/rateLimiter';
import { validate } from '@backend/validators/validate.middleware';
import { registerSchema, loginSchema } from '@backend/validators/auth.validator';
import { authenticate } from '@backend/middlewares/auth';

const router = Router();

router.get('/bootstrap', bootstrap);
router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
