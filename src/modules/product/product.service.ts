import { Prisma, ProductType } from '@prisma/client';
import { prisma } from '../../prisma/client.js';
import { AppError } from '../../utils/app-error.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

export class ProductService {
  static async list(
    organizationId: string,
    options: { page: number; limit: number; search?: string; type?: ProductType }
  ) {
    const skip = (options.page - 1) * options.limit;

    const where: Prisma.ProductWhereInput = {
      organizationId,
      ...(options.type ? { type: options.type } : {}),
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

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          plans: {
            where: { isActive: true },
          },
          _count: {
            select: {
              plans: true,
              invoiceItems: true,
            },
          },
        },
      }),
    ]);

    return {
      products,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  static async getById(organizationId: string, id: string) {
    const product = await prisma.product.findFirst({
      where: { id, organizationId },
      include: {
        plans: true,
        discounts: true,
      },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    return product;
  }

  static async create(
    organizationId: string,
    data: Prisma.ProductCreateInput,
    userId?: string
  ) {
    const code = data.code.toUpperCase();

    const existing = await prisma.product.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code,
        },
      },
    });

    if (existing) {
      throw AppError.conflict(`Product with code '${code}' already exists.`);
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        code,
        variants: data.variants ? (data.variants as Prisma.InputJsonValue) : Prisma.JsonNull,
        organization: { connect: { id: organizationId } },
      },
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'PRODUCT_CREATED',
      entity: 'Product',
      entityId: product.id,
      newValues: { name: product.name, code: product.code, salesPrice: product.salesPrice },
    });

    return product;
  }

  static async update(
    organizationId: string,
    id: string,
    data: Prisma.ProductUpdateInput,
    userId?: string
  ) {
    const existing = await prisma.product.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw AppError.notFound('Product not found');
    }

    if (data.code && typeof data.code === 'string') {
      const codeUpper = data.code.toUpperCase();
      if (codeUpper !== existing.code) {
        const conflict = await prisma.product.findUnique({
          where: {
            organizationId_code: {
              organizationId,
              code: codeUpper,
            },
          },
        });
        if (conflict) {
          throw AppError.conflict(`Product with code '${codeUpper}' already exists.`);
        }
        data.code = codeUpper;
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        variants: data.variants !== undefined ? (data.variants as Prisma.InputJsonValue) : undefined,
      },
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entityId: id,
      oldValues: existing,
      newValues: updated,
    });

    return updated;
  }

  static async delete(organizationId: string, id: string, userId?: string) {
    const product = await prisma.product.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: {
            plans: true,
            invoiceItems: true,
          },
        },
      },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    if (product._count.plans > 0 || product._count.invoiceItems > 0) {
      throw AppError.badRequest(
        'Cannot delete product that has existing subscription plans or billing invoice line items. Set isActive = false to retire it.'
      );
    }

    await prisma.product.delete({ where: { id } });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'PRODUCT_DELETED',
      entity: 'Product',
      entityId: id,
      oldValues: { name: product.name, code: product.code },
    });

    return { message: 'Product deleted successfully' };
  }
}
