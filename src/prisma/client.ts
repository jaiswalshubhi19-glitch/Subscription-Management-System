import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database via Prisma');
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL database', error);
    // Don't kill process immediately during build or test environments
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Disconnected from database');
}
