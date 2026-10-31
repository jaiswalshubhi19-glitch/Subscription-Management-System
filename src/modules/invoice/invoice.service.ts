import { InvoiceStatus, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client.js';
import { AppError } from '../../utils/app-error.js';
import { MoneyUtil } from '../../utils/money.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

export interface CreateInvoiceItemInput {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxAmount?: number;
}

export interface CreateInvoiceInput {
  customerId: string;
  subscriptionId?: string;
  dueDate: string;
  items: CreateInvoiceItemInput[];
  notes?: string;
  currency?: string;
  status?: InvoiceStatus;
}

export class InvoiceService {
  static async list(
    organizationId: string,
    options: {
      page: number;
      limit: number;
      status?: InvoiceStatus;
      customerId?: string;
      subscriptionId?: string;
      search?: string;
    }
  ) {
    const skip = (options.page - 1) * options.limit;

    const where: Prisma.InvoiceWhereInput = {
      organizationId,
      ...(options.status ? { status: options.status } : {}),
      ...(options.customerId ? { customerId: options.customerId } : {}),
      ...(options.subscriptionId ? { subscriptionId: options.subscriptionId } : {}),
      ...(options.search
        ? {
            OR: [
              { invoiceNumber: { contains: options.search, mode: 'insensitive' } },
              { customer: { name: { contains: options.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true, customerNumber: true, company: true },
          },
          subscription: {
            select: { id: true, subscriptionNumber: true, status: true },
          },
          items: true,
          _count: {
            select: { allocations: true },
          },
        },
      }),
    ]);

    return {
      invoices,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  static async getById(organizationId: string, id: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        subscription: {
          include: { plan: true },
        },
        items: {
          include: { product: true },
        },
        allocations: {
          include: {
            payment: true,
          },
        },
        issues: true,
      },
    });

    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    return invoice;
  }

  static async create(
    organizationId: string,
    data: CreateInvoiceInput,
    userId?: string
  ) {
    // 1. Verify customer
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, organizationId },
    });
    if (!customer) {
      throw AppError.notFound('Customer not found in this organization');
    }

    // 2. Calculate line items and totals safely using integer minor units
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    const formattedItems = data.items.map((item) => {
      const gross = item.quantity * item.unitPrice;
      const discount = item.discountAmount || 0;
      const tax = item.taxAmount || 0;
      const totalAmount = MoneyUtil.calculateLineTotal(item.quantity, item.unitPrice, discount, tax);

      subtotal += gross;
      discountTotal += discount;
      taxTotal += tax;

      return {
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: discount,
        taxAmount: tax,
        totalAmount,
      };
    });

    const netAmount = Math.max(0, subtotal - discountTotal);
    const finalTotal = netAmount + taxTotal;

    // Customer frozen snapshot
    const customerSnapshot = {
      name: customer.name,
      email: customer.email,
      company: customer.company,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      postalCode: customer.postalCode,
      taxId: customer.taxId,
    };

    const count = await prisma.invoice.count({ where: { organizationId } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          organizationId,
          invoiceNumber,
          customerId: customer.id,
          subscriptionId: data.subscriptionId,
          status: data.status || 'OPEN',
          billingReason: data.subscriptionId ? 'SUBSCRIPTION_CYCLE' : 'MANUAL',
          currency: data.currency?.toUpperCase() || 'USD',
          subtotal,
          discountTotal,
          taxRate: 0,
          taxTotal,
          total: finalTotal,
          amountPaid: 0,
          amountDue: finalTotal,
          dueDate: new Date(data.dueDate),
          customerSnapshot,
          notes: data.notes,
          items: {
            create: formattedItems,
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      await AuditLogService.record(
        {
          organizationId,
          userId,
          action: 'INVOICE_CREATED',
          entity: 'Invoice',
          entityId: created.id,
          newValues: {
            invoiceNumber: created.invoiceNumber,
            total: created.total,
            status: created.status,
          },
        },
        tx
      );

      return created;
    });

    return invoice;
  }

  static async voidInvoice(organizationId: string, id: string, userId?: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId },
      include: { allocations: true },
    });

    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    if (invoice.status === 'PAID') {
      throw AppError.badRequest('Cannot void an invoice that has already been fully paid. Issue a refund or credit memo.');
    }

    if (invoice.status === 'VOID') {
      throw AppError.badRequest('Invoice is already voided.');
    }

    if (invoice.amountPaid > 0) {
      throw AppError.badRequest(
        `Cannot void an invoice with existing payment allocations (${invoice.amountPaid} minor units already paid). Unallocate payments first.`
      );
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'VOID',
        amountDue: 0,
        voidedAt: new Date(),
      },
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'INVOICE_VOIDED',
      entity: 'Invoice',
      entityId: id,
      oldValues: { status: invoice.status, amountDue: invoice.amountDue },
      newValues: { status: 'VOID', amountDue: 0 },
    });

    return updated;
  }
}
