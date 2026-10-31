import bcrypt from 'bcryptjs';
import { Role, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client.js';
import { AppError } from '../../utils/app-error.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

export class OrgService {
  static async getOrganization(orgId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            members: true,
            customers: true,
            subscriptions: true,
            invoices: true,
          },
        },
      },
    });

    if (!org) {
      throw AppError.notFound('Organization not found');
    }

    return org;
  }

  static async updateOrganization(
    orgId: string,
    data: {
      name?: string;
      currency?: string;
      timezone?: string;
      taxRate?: number;
      billingAddress?: Record<string, unknown>;
    },
    userId?: string
  ) {
    const existing = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!existing) {
      throw AppError.notFound('Organization not found');
    }

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.currency ? { currency: data.currency.toUpperCase() } : {}),
        ...(data.timezone ? { timezone: data.timezone } : {}),
        ...(data.taxRate !== undefined ? { taxRate: data.taxRate } : {}),
        ...(data.billingAddress ? { billingAddress: data.billingAddress as Prisma.InputJsonValue } : {}),
      },
    });

    await AuditLogService.record({
      organizationId: orgId,
      userId,
      action: 'ORG_UPDATE',
      entity: 'Organization',
      entityId: orgId,
      oldValues: existing,
      newValues: updated,
    });

    return updated;
  }

  static async listTeamMembers(orgId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async inviteMember(
    orgId: string,
    data: { email: string; name: string; role: Role; temporaryPassword?: string },
    actorUserId?: string
  ) {
    const email = data.email.toLowerCase();

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const defaultPass = data.temporaryPassword || 'Brightloop@2026';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPass, salt);

      user = await prisma.user.create({
        data: {
          email,
          name: data.name,
          passwordHash,
        },
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw AppError.conflict('This user is already a member of your organization.');
    }

    const membership = await prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: user.id,
        role: data.role,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    await AuditLogService.record({
      organizationId: orgId,
      userId: actorUserId,
      action: 'TEAM_MEMBER_INVITED',
      entity: 'OrganizationMember',
      entityId: membership.id,
      newValues: { invitedEmail: email, role: data.role },
    });

    return membership;
  }

  static async updateMemberRole(
    orgId: string,
    memberId: string,
    newRole: Role,
    actorUserId?: string
  ) {
    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId: orgId },
    });

    if (!member) {
      throw AppError.notFound('Team member not found in this organization');
    }

    // Prevent removing the last OWNER
    if (member.role === 'OWNER' && newRole !== 'OWNER') {
      const ownerCount = await prisma.organizationMember.count({
        where: { organizationId: orgId, role: 'OWNER' },
      });
      if (ownerCount <= 1) {
        throw AppError.badRequest('Cannot demote the only OWNER of the organization.');
      }
    }

    const updated = await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role: newRole },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    await AuditLogService.record({
      organizationId: orgId,
      userId: actorUserId,
      action: 'MEMBER_ROLE_UPDATED',
      entity: 'OrganizationMember',
      entityId: memberId,
      oldValues: { role: member.role },
      newValues: { role: newRole },
    });

    return updated;
  }
}
