import { Router } from 'express';
import { z } from 'zod';
import { AssistantController } from './assistant.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { aiRateLimiter } from '../../middlewares/rate-limit.middleware.js';

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message cannot exceed 1000 characters'),
});

router.use(authenticate);

router.post(
  '/chat',
  aiRateLimiter,
  validate({ body: chatSchema }),
  AssistantController.chat
);

export default router;
