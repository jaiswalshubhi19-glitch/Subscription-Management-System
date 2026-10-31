import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  organizationName: string;
  currency?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static generateToken(userId: string, organizationId: string): string {
    return jwt.sign({ userId, organizationId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw AppError.conflict('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const slugBase = input.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name: input.organizationName,
          slug,
          currency: input.currency?.toUpperCase() || 'USD',
        },
      });

      // 2. Create User
      const user = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          name: input.name,
          passwordHash,
        },
      });

      // 3. Create Owner Membership
      const membership = await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      // 4. Record Audit Log
      await AuditLogService.record(
        {
          organizationId: org.id,
          userId: user.id,
          action: 'ORG_REGISTERED',
          entity: 'Organization',
          entityId: org.id,
          newValues: { orgName: org.name, userEmail: user.email },
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
        tx
      );

      return { user, org, membership };
    });

    const token = this.generateToken(result.user.id, result.org.id);

    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      organization: {
        id: result.org.id,
        name: result.org.name,
        slug: result.org.slug,
        currency: result.org.currency,
        role: result.membership.role,
      },
    };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    if (user.memberships.length === 0) {
      throw AppError.forbidden('User does not belong to any active organization.');
    }

    const primaryMembership = user.memberships[0];
    const token = this.generateToken(user.id, primaryMembership.organizationId);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      organization: {
        id: primaryMembership.organization.id,
        name: primaryMembership.organization.name,
        slug: primaryMembership.organization.slug,
        currency: primaryMembership.organization.currency,
        role: primaryMembership.role,
      },
      allOrganizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role,
      })),
    };
  }

  static async getMe(userId: string, currentOrgId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('User profile not found');
    }

    const currentMembership =
      user.memberships.find((m) => m.organizationId === currentOrgId) || user.memberships[0];

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      organization: currentMembership
        ? {
            id: currentMembership.organization.id,
            name: currentMembership.organization.name,
            slug: currentMembership.organization.slug,
            currency: currentMembership.organization.currency,
            timezone: currentMembership.organization.timezone,
            taxRate: currentMembership.organization.taxRate,
            role: currentMembership.role,
          }
        : null,
      allOrganizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role,
      })),
    };
  }
}
