import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 queries per minute
  message: {
    success: false,
    error: {
      message: 'AI Assistant rate limit reached. Please wait a moment before sending more queries.',
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please slow down.',
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
