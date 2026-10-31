import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
  message?: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiResponse<T>['meta'],
  message?: string
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
    ...(message ? { message } : {}),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown,
  code?: string
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(code ? { code } : {}),
      ...(details ? { details } : {}),
    },
  });
}
