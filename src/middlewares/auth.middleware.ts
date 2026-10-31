import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AUTH_COOKIE_NAME } from '../config/constants.js';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/app-error.js';
import { Role } from '@prisma/client';

interface JwtPayload {
  userId: string;
  organizationId?: string;
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // 1. Check HTTP-only signed/standard cookies
    if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
      token = req.cookies[AUTH_COOKIE_NAME];
    }

    // 2. Fallback to Authorization header Bearer token
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      throw AppError.unauthorized('Authentication required. Please log in.');
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw AppError.unauthorized('Invalid or expired authentication token.');
    }

    if (!decoded.userId) {
      throw AppError.unauthorized('Invalid token payload.');
    }

    // Fetch user and active organization membership
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw AppError.unauthorized('User account does not exist or has been deactivated.');
    }

    // Determine organization membership
    // Note: Do not trust organization IDs supplied by client in query or body!
    // If token has organizationId, verify user actually belongs to that organization.
    // If not in token, take the user's primary/first organization membership.
    let membership;
    if (decoded.organizationId) {
      membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: decoded.organizationId,
            userId: user.id,
          },
        },
      });
    }

    if (!membership) {
      // Find first available membership for user
      membership = await prisma.organizationMember.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });
    }

    if (!membership) {
      throw AppError.forbidden('You are not associated with any active organization.');
    }

    req.user = user;
    req.membership = {
      id: membership.id,
      organizationId: membership.organizationId,
      role: membership.role as Role,
    };
    req.organizationId = membership.organizationId;

    next();
  } catch (error) {
    next(error);
  }
}
