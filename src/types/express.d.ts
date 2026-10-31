import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthMembership {
  id: string;
  organizationId: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      membership?: AuthMembership;
      organizationId?: string;
    }
  }
}
