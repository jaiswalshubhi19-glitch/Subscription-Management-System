import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/app-error.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): Response {
  // Operational AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        details: err.details,
      },
    });
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formatted = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        statusCode: 400,
        details: formatted,
      },
    });
  }

  // Prisma Database Known Request Error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn(`Prisma error: ${err.code}`, { meta: err.meta });
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json({
        success: false,
        error: {
          message: `Unique constraint violation: A record with this ${target} already exists.`,
          statusCode: 409,
          code: 'DUPLICATE_ENTRY',
        },
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Requested record was not found or has been deleted.',
          statusCode: 404,
          code: 'NOT_FOUND',
        },
      });
    }

    return res.status(400).json({
      success: false,
      error: {
        message: 'Database query error',
        statusCode: 400,
        code: err.code,
      },
    });
  }

  // Unexpected Server Errors
  logger.error('Unhandled Server Error', err);

  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : err instanceof Error
      ? err.message
      : 'Unknown internal error';

  return res.status(500).json({
    success: false,
    error: {
      message,
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
}
