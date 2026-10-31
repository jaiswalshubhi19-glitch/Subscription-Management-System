import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authRateLimiter } from '../../middlewares/rate-limit.middleware.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  AuthController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  AuthController.login
);

router.post('/logout', AuthController.logout);

router.get('/me', authenticate, AuthController.getMe);

export default router;
