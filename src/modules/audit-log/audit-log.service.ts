import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client.js';
import { logger } from '../../utils/logger.js';

export interface AuditLogParams {
  organizationId: string;
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogService {
  /**
   * Record an audit log entry.
   * Accepts optional Prisma transaction client to be part of the atomic commit.
   */
  static async record(
    params: AuditLogParams,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx || prisma;
    try {
      await client.auditLog.create({
        data: {
          organizationId: params.organizationId,
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          oldValues: params.oldValues ? (params.oldValues as Prisma.InputJsonValue) : Prisma.JsonNull,
          newValues: params.newValues ? (params.newValues as Prisma.InputJsonValue) : Prisma.JsonNull,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch (error) {
      // Never crash the primary business operation if audit logging fails
      logger.error('Failed to create audit log entry', error);
    }
  }

  static async list(organizationId: string, options: { page?: number; limit?: number; entity?: string; action?: string }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {
      organizationId,
      ...(options.entity ? { entity: options.entity } : {}),
      ...(options.action ? { action: options.action } : {}),
    };

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
