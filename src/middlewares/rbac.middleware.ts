import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { ROLE_HIERARCHY, AppRole } from '../config/constants.js';
import { AppError } from '../utils/app-error.js';

/**
 * Require a minimum role based on hierarchy
 * e.g. requireRole('ADMIN') permits OWNER and ADMIN.
 */
export function requireRole(minimumRole: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.membership) {
      return next(AppError.unauthorized('Authentication required'));
    }

    const userRole = req.membership.role as AppRole;
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole as AppRole] ?? 99;

    if (userLevel < requiredLevel) {
      return next(
        AppError.forbidden(
          `Permission denied: Action requires at least ${minimumRole} privileges. You have ${userRole}.`
        )
      );
    }

    next();
  };
}

/**
 * Require one of the specified roles
 */
export function requireAnyRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.membership) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.membership.role)) {
      return next(
        AppError.forbidden(
          `Permission denied: Action restricted to roles: [${allowedRoles.join(', ')}].`
        )
      );
    }

    next();
  };
}
