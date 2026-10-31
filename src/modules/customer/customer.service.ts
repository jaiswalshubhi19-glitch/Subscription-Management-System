import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client.js';
import { AppError } from '../../utils/app-error.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

export class CustomerService {
  static async list(
    organizationId: string,
    options: { page: number; limit: number; search?: string }
  ) {
    const skip = (options.page - 1) * options.limit;

    const where: Prisma.CustomerWhereInput = {
      organizationId,
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: 'insensitive' } },
              { email: { contains: options.search, mode: 'insensitive' } },
              { customerNumber: { contains: options.search, mode: 'insensitive' } },
              { company: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              subscriptions: true,
              invoices: true,
              payments: true,
            },
          },
        },
      }),
    ]);

    return {
      customers,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  static async getById(organizationId: string, id: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, organizationId },
      include: {
        subscriptions: {
          include: {
            plan: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          take: 10,
          orderBy: { paidAt: 'desc' },
        },
        issues: {
          where: { status: 'OPEN' },
        },
      },
    });

    if (!customer) {
      throw AppError.notFound('Customer not found');
    }

    return customer;
  }

  static async create(
    organizationId: string,
    data: Prisma.CustomerCreateInput,
    userId?: string
  ) {
    const email = data.email.toLowerCase();

    // Check duplicate email within this organization
    const existing = await prisma.customer.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email,
        },
      },
    });

    if (existing) {
      throw AppError.conflict('A customer with this email already exists in your organization.');
    }

    // Generate next customer number
    const count = await prisma.customer.count({ where: { organizationId } });
    const customerNumber = `CUST-${(count + 1).toString().padStart(5, '0')}`;

    const customer = await prisma.customer.create({
      data: {
        ...data,
        email,
        customerNumber,
        organization: { connect: { id: organizationId } },
      },
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'CUSTOMER_CREATED',
      entity: 'Customer',
      entityId: customer.id,
      newValues: { customerNumber: customer.customerNumber, email: customer.email },
    });

    return customer;
  }

  static async update(
    organizationId: string,
    id: string,
    data: Prisma.CustomerUpdateInput,
    userId?: string
  ) {
    const existing = await prisma.customer.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw AppError.notFound('Customer not found');
    }

    if (data.email && typeof data.email === 'string') {
      const emailLower = data.email.toLowerCase();
      if (emailLower !== existing.email) {
        const conflict = await prisma.customer.findUnique({
          where: {
            organizationId_email: {
              organizationId,
              email: emailLower,
            },
          },
        });
        if (conflict) {
          throw AppError.conflict('A customer with this email already exists.');
        }
        data.email = emailLower;
      }
    }

    const updated = await prisma.customer.update({
      where: { id },
      data,
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'CUSTOMER_UPDATED',
      entity: 'Customer',
      entityId: id,
      oldValues: existing,
      newValues: updated,
    });

    return updated;
  }

  static async delete(organizationId: string, id: string, userId?: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: {
            invoices: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!customer) {
      throw AppError.notFound('Customer not found');
    }

    if (customer._count.invoices > 0 || customer._count.subscriptions > 0) {
      throw AppError.badRequest(
        'Cannot delete customer with existing subscription contracts or historical billing invoices. Consider marking them inactive or archiving.'
      );
    }

    await prisma.customer.delete({ where: { id } });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'CUSTOMER_DELETED',
      entity: 'Customer',
      entityId: id,
      oldValues: { customerNumber: customer.customerNumber, email: customer.email },
    });

    return { message: 'Customer deleted successfully' };
  }
}
