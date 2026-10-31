import { describe, it, expect } from 'vitest';
import { requireRole, requireAnyRole } from '../../src/middlewares/rbac.middleware.js';
import { Request, Response } from 'express';
import { AppError } from '../../src/utils/app-error.js';

describe('RBAC Middleware - Role and Permission Boundaries', () => {
  const createMockReq = (role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'): Request => {
    return {
      membership: role ? { role, id: 'mem-1', organizationId: 'org-1' } : undefined,
    } as unknown as Request;
  };

  const createMockRes = (): Response => ({}) as unknown as Response;

  it('allows OWNER to access ADMIN endpoints', () => {
    const middleware = requireRole('ADMIN');
    const req = createMockReq('OWNER');
    let calledNext = false;

    middleware(req, createMockRes(), (err) => {
      expect(err).toBeUndefined();
      calledNext = true;
    });

    expect(calledNext).toBe(true);
  });

  it('allows ADMIN to access MEMBER endpoints', () => {
    const middleware = requireRole('MEMBER');
    const req = createMockReq('ADMIN');
    let calledNext = false;

    middleware(req, createMockRes(), (err) => {
      expect(err).toBeUndefined();
      calledNext = true;
    });

    expect(calledNext).toBe(true);
  });

  it('blocks VIEWER from accessing ADMIN endpoints with 403 Forbidden', () => {
    const middleware = requireRole('ADMIN');
    const req = createMockReq('VIEWER');
    let errorPassed: unknown;

    middleware(req, createMockRes(), (err) => {
      errorPassed = err;
    });

    expect(errorPassed).toBeInstanceOf(AppError);
    expect((errorPassed as AppError).statusCode).toBe(403);
  });

  it('blocks MEMBER from accessing OWNER-only endpoints', () => {
    const middleware = requireRole('OWNER');
    const req = createMockReq('MEMBER');
    let errorPassed: unknown;

    middleware(req, createMockRes(), (err) => {
      errorPassed = err;
    });

    expect(errorPassed).toBeInstanceOf(AppError);
    expect((errorPassed as AppError).statusCode).toBe(403);
  });

  it('returns 401 when no membership is attached', () => {
    const middleware = requireRole('MEMBER');
    const req = createMockReq();
    let errorPassed: unknown;

    middleware(req, createMockRes(), (err) => {
      errorPassed = err;
    });

    expect(errorPassed).toBeInstanceOf(AppError);
    expect((errorPassed as AppError).statusCode).toBe(401);
  });

  it('requireAnyRole allows specified roles only', () => {
    const middleware = requireAnyRole('OWNER', 'ADMIN');
    const reqAdmin = createMockReq('ADMIN');
    let adminAllowed = false;
    middleware(reqAdmin, createMockRes(), () => {
      adminAllowed = true;
    });
    expect(adminAllowed).toBe(true);

    const reqMember = createMockReq('MEMBER');
    let memberError: unknown;
    middleware(reqMember, createMockRes(), (err) => {
      memberError = err;
    });
    expect(memberError).toBeInstanceOf(AppError);
  });
});
