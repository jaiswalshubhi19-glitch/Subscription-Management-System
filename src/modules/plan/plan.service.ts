import { BillingInterval, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client.js';
import { AppError } from '../../utils/app-error.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

export class PlanService {
  static async list(
    organizationId: string,
    options: {
      page: number;
      limit: number;
      productId?: string;
      billingInterval?: BillingInterval;
      search?: string;
    }
  ) {
    const skip = (options.page - 1) * options.limit;

    const where: Prisma.PlanWhereInput = {
      organizationId,
      ...(options.productId ? { productId: options.productId } : {}),
      ...(options.billingInterval ? { billingInterval: options.billingInterval } : {}),
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: 'insensitive' } },
              { code: { contains: options.search, mode: 'insensitive' } },
              { description: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, plans] = await Promise.all([
      prisma.plan.count({ where }),
      prisma.plan.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, code: true, type: true },
          },
          _count: {
            select: { subscriptions: true },
          },
        },
      }),
    ]);

    return {
      plans,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  static async getById(organizationId: string, id: string) {
    const plan = await prisma.plan.findFirst({
      where: { id, organizationId },
      include: {
        product: true,
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!plan) {
      throw AppError.notFound('Plan not found');
    }

    return plan;
  }

  static async create(
    organizationId: string,
    data: Prisma.PlanCreateInput & { productId: string },
    userId?: string
  ) {
    // Verify product belongs to this organization
    const product = await prisma.product.findFirst({
      where: { id: data.productId, organizationId },
    });

    if (!product) {
      throw AppError.notFound('Product associated with this plan does not exist in your organization.');
    }

    const code = data.code.toUpperCase();
    const existing = await prisma.plan.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code,
        },
      },
    });

    if (existing) {
      throw AppError.conflict(`Plan with code '${code}' already exists.`);
    }

    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        code,
        description: data.description,
        billingInterval: data.billingInterval,
        intervalCount: data.intervalCount,
        price: data.price,
        currency: data.currency ? data.currency.toUpperCase() : 'USD',
        trialPeriodDays: data.trialPeriodDays,
        minQuantity: data.minQuantity,
        maxQuantity: data.maxQuantity,
        autoCloseOnExpiry: data.autoCloseOnExpiry,
        allowEarlyCancellation: data.allowEarlyCancellation,
        allowPause: data.allowPause,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive,
        organization: { connect: { id: organizationId } },
        product: { connect: { id: data.productId } },
      },
      include: {
        product: true,
      },
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'PLAN_CREATED',
      entity: 'Plan',
      entityId: plan.id,
      newValues: { name: plan.name, code: plan.code, price: plan.price, interval: plan.billingInterval },
    });

    return plan;
  }

  static async update(
    organizationId: string,
    id: string,
    data: Prisma.PlanUpdateInput,
    userId?: string
  ) {
    const existing = await prisma.plan.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw AppError.notFound('Plan not found');
    }

    if (data.code && typeof data.code === 'string') {
      const codeUpper = data.code.toUpperCase();
      if (codeUpper !== existing.code) {
        const conflict = await prisma.plan.findUnique({
          where: {
            organizationId_code: {
              organizationId,
              code: codeUpper,
            },
          },
        });
        if (conflict) {
          throw AppError.conflict(`Plan with code '${codeUpper}' already exists.`);
        }
        data.code = codeUpper;
      }
    }

    const updated = await prisma.plan.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'PLAN_UPDATED',
      entity: 'Plan',
      entityId: id,
      oldValues: existing,
      newValues: updated,
    });

    return updated;
  }

  static async delete(organizationId: string, id: string, userId?: string) {
    const plan = await prisma.plan.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!plan) {
      throw AppError.notFound('Plan not found');
    }

    if (plan._count.subscriptions > 0) {
      throw AppError.badRequest(
        'Cannot delete plan with active or past subscription contracts. Set isActive = false instead to retire it.'
      );
    }

    await prisma.plan.delete({ where: { id } });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'PLAN_DELETED',
      entity: 'Plan',
      entityId: id,
      oldValues: { name: plan.name, code: plan.code },
    });

    return { message: 'Plan deleted successfully' };
  }
}
