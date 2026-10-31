import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/subscriptiq?schema=public'),
  JWT_SECRET: z.string().min(16).default('subscriptiq-production-secure-jwt-key-at-least-32-characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('subscriptiq-secure-cookie-secret-key-32-characters'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  GROK_API_KEY: z.string().optional().default(''),
  GROK_API_URL: z.string().default('https://api.x.ai/v1'),
  GROK_MODEL: z.string().default('grok-beta'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
