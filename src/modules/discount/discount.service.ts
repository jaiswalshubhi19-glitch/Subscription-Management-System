import { Discount, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client.js';
import { AppError } from '../../utils/app-error.js';
import { MoneyUtil } from '../../utils/money.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

export class DiscountService {
  static async list(
    organizationId: string,
    options: { page: number; limit: number; search?: string; isActive?: boolean }
  ) {
    const skip = (options.page - 1) * options.limit;

    const where: Prisma.DiscountWhereInput = {
      organizationId,
      ...(options.isActive !== undefined ? { isActive: options.isActive } : {}),
      ...(options.search
        ? {
            OR: [
              { code: { contains: options.search, mode: 'insensitive' } },
              { name: { contains: options.search, mode: 'insensitive' } },
              { description: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, discounts] = await Promise.all([
      prisma.discount.count({ where }),
      prisma.discount.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { subscriptions: true },
          },
        },
      }),
    ]);

    return {
      discounts,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  static async getById(organizationId: string, id: string) {
    const discount = await prisma.discount.findFirst({
      where: { id, organizationId },
      include: {
        product: true,
      },
    });

    if (!discount) {
      throw AppError.notFound('Discount rule not found');
    }

    return discount;
  }

  static async create(
    organizationId: string,
    data: Prisma.DiscountCreateInput & { productId?: string },
    userId?: string
  ) {
    const code = data.code.toUpperCase();

    const existing = await prisma.discount.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code,
        },
      },
    });

    if (existing) {
      throw AppError.conflict(`Discount with code '${code}' already exists in your organization.`);
    }

    if (data.productId) {
      const product = await prisma.product.findFirst({
        where: { id: data.productId, organizationId },
      });
      if (!product) {
        throw AppError.notFound('Product associated with this discount does not exist in your organization.');
      }
    }

    const discount = await prisma.discount.create({
      data: {
        code,
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        currency: data.currency ? data.currency.toUpperCase() : null,
        appliesTo: data.appliesTo,
        minPurchaseAmount: data.minPurchaseAmount,
        minQuantity: data.minQuantity,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        maxUses: data.maxUses,
        isActive: data.isActive,
        organization: { connect: { id: organizationId } },
        ...(data.productId ? { product: { connect: { id: data.productId } } } : {}),
      },
      include: {
        product: true,
      },
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'DISCOUNT_CREATED',
      entity: 'Discount',
      entityId: discount.id,
      newValues: { code: discount.code, type: discount.type, value: discount.value },
    });

    return discount;
  }

  static async update(
    organizationId: string,
    id: string,
    data: Prisma.DiscountUpdateInput,
    userId?: string
  ) {
    const existing = await prisma.discount.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw AppError.notFound('Discount not found');
    }

    if (data.code && typeof data.code === 'string') {
      const codeUpper = data.code.toUpperCase();
      if (codeUpper !== existing.code) {
        const conflict = await prisma.discount.findUnique({
          where: {
            organizationId_code: {
              organizationId,
              code: codeUpper,
            },
          },
        });
        if (conflict) {
          throw AppError.conflict(`Discount with code '${codeUpper}' already exists.`);
        }
        data.code = codeUpper;
      }
    }

    const updated = await prisma.discount.update({
      where: { id },
      data,
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'DISCOUNT_UPDATED',
      entity: 'Discount',
      entityId: id,
      oldValues: existing,
      newValues: updated,
    });

    return updated;
  }

  static async delete(organizationId: string, id: string, userId?: string) {
    const discount = await prisma.discount.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!discount) {
      throw AppError.notFound('Discount not found');
    }

    if (discount._count.subscriptions > 0) {
      throw AppError.badRequest(
        'Cannot delete discount that is actively attached to customer subscriptions. Set isActive = false instead to deactivate.'
      );
    }

    await prisma.discount.delete({ where: { id } });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'DISCOUNT_DELETED',
      entity: 'Discount',
      entityId: id,
      oldValues: { code: discount.code },
    });

    return { message: 'Discount deleted successfully' };
  }

  /**
   * Evaluate if a discount can be applied and calculate discount amount in minor units
   */
  static calculateDiscountAmount(
    discount: Discount,
    grossAmount: number,
    quantity: number,
    productId?: string
  ): { valid: boolean; discountAmount: number; reason?: string } {
    const now = new Date();

    if (!discount.isActive) {
      return { valid: false, discountAmount: 0, reason: 'Discount is inactive' };
    }

    if (discount.startDate && now < discount.startDate) {
      return { valid: false, discountAmount: 0, reason: 'Discount is not yet active' };
    }

    if (discount.endDate && now > discount.endDate) {
      return { valid: false, discountAmount: 0, reason: 'Discount has expired' };
    }

    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      return { valid: false, discountAmount: 0, reason: 'Discount has reached its maximum usage limit' };
    }

    if (discount.minQuantity !== null && quantity < discount.minQuantity) {
      return { valid: false, discountAmount: 0, reason: `Minimum quantity of ${discount.minQuantity} required` };
    }

    if (discount.minPurchaseAmount !== null && grossAmount < discount.minPurchaseAmount) {
      return { valid: false, discountAmount: 0, reason: `Minimum purchase amount of ${discount.minPurchaseAmount} required` };
    }

    if (discount.appliesTo === 'SPECIFIC_PRODUCT' && discount.productId && productId !== discount.productId) {
      return { valid: false, discountAmount: 0, reason: 'Discount does not apply to this product' };
    }

    let calculated = 0;
    if (discount.type === 'PERCENTAGE') {
      calculated = MoneyUtil.calculatePercentageDiscount(grossAmount, discount.value);
    } else {
      // Fixed amount
      calculated = Math.min(grossAmount, discount.value);
    }

    return { valid: true, discountAmount: calculated };
  }
}
