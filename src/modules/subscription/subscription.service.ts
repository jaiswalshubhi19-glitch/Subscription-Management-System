import { Prisma, SubscriptionStatus } from '@prisma/client';
import { prisma } from '../../prisma/client.js';
import { AppError } from '../../utils/app-error.js';
import { BillingDateUtil } from '../../utils/billing-dates.js';
import { MoneyUtil } from '../../utils/money.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { NotificationService } from '../notification/notification.service.js';

export class SubscriptionService {
  static async list(
    organizationId: string,
    options: {
      page: number;
      limit: number;
      status?: SubscriptionStatus;
      customerId?: string;
      planId?: string;
      search?: string;
    }
  ) {
    const skip = (options.page - 1) * options.limit;

    const where: Prisma.SubscriptionWhereInput = {
      organizationId,
      ...(options.status ? { status: options.status } : {}),
      ...(options.customerId ? { customerId: options.customerId } : {}),
      ...(options.planId ? { planId: options.planId } : {}),
      ...(options.search
        ? {
            OR: [
              { subscriptionNumber: { contains: options.search, mode: 'insensitive' } },
              { customer: { name: { contains: options.search, mode: 'insensitive' } } },
              { plan: { name: { contains: options.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [total, subscriptions] = await Promise.all([
      prisma.subscription.count({ where }),
      prisma.subscription.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true, company: true, customerNumber: true },
          },
          plan: {
            include: { product: true },
          },
          discounts: {
            include: { discount: true },
          },
          _count: {
            select: { invoices: true },
          },
        },
      }),
    ]);

    return {
      subscriptions,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  static async getById(organizationId: string, id: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        plan: {
          include: { product: true },
        },
        discounts: {
          include: { discount: true },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
        issues: {
          where: { status: 'OPEN' },
        },
      },
    });

    if (!subscription) {
      throw AppError.notFound('Subscription not found');
    }

    return subscription;
  }

  static async create(
    organizationId: string,
    data: {
      customerId: string;
      planId: string;
      quantity?: number;
      status?: SubscriptionStatus;
      startDate?: string;
      paymentTerms?: string;
      notes?: string;
      discountIds?: string[];
      validUntil?: string;
      generateInitialInvoice?: boolean;
    },
    userId?: string
  ) {
    const quantity = data.quantity || 1;

    // Verify Customer
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, organizationId },
    });
    if (!customer) {
      throw AppError.notFound('Customer not found in this organization');
    }

    // Verify Plan
    const plan = await prisma.plan.findFirst({
      where: { id: data.planId, organizationId },
      include: { product: true },
    });
    if (!plan || !plan.isActive) {
      throw AppError.badRequest('Selected plan is inactive or does not exist');
    }

    // Validate quantities
    if (quantity < plan.minQuantity) {
      throw AppError.badRequest(`Minimum quantity for plan '${plan.name}' is ${plan.minQuantity}`);
    }
    if (plan.maxQuantity && quantity > plan.maxQuantity) {
      throw AppError.badRequest(`Maximum quantity for plan '${plan.name}' is ${plan.maxQuantity}`);
    }

    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const periodEnd = BillingDateUtil.calculatePeriodEnd(
      startDate,
      plan.billingInterval,
      plan.intervalCount
    );

    let initialStatus = data.status || 'ACTIVE';
    let trialEndsAt: Date | null = null;
    if (plan.trialPeriodDays > 0 && initialStatus === 'ACTIVE') {
      initialStatus = 'TRIALING';
      trialEndsAt = new Date(startDate.getTime() + plan.trialPeriodDays * 24 * 60 * 60 * 1000);
    }

    // Generate unique subscription number
    const subCount = await prisma.subscription.count({ where: { organizationId } });
    const subscriptionNumber = `SUB-${(subCount + 1).toString().padStart(5, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Subscription record
      const subscription = await tx.subscription.create({
        data: {
          organizationId,
          subscriptionNumber,
          customerId: customer.id,
          planId: plan.id,
          status: initialStatus,
          quantity,
          unitPrice: plan.price,
          currency: plan.currency,
          currentPeriodStart: startDate,
          currentPeriodEnd: periodEnd,
          renewalDate: periodEnd,
          trialEndsAt,
          paymentTerms: data.paymentTerms || 'Due on receipt',
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          notes: data.notes,
        },
      });

      // 2. Attach discounts if provided
      if (data.discountIds && data.discountIds.length > 0) {
        for (const discountId of data.discountIds) {
          const discount = await tx.discount.findFirst({
            where: { id: discountId, organizationId },
          });
          if (discount) {
            await tx.subscriptionDiscount.create({
              data: {
                subscriptionId: subscription.id,
                discountId: discount.id,
              },
            });
          }
        }
      }

      // 3. Generate initial invoice if requested and active/trialing
      let invoice = null;
      if (data.generateInitialInvoice && (initialStatus === 'ACTIVE' || initialStatus === 'QUOTATION')) {
        const invCount = await tx.invoice.count({ where: { organizationId } });
        const invoiceNumber = `INV-${new Date().getFullYear()}-${(invCount + 1).toString().padStart(5, '0')}`;
        const dueDate = BillingDateUtil.calculateDueDate(startDate, subscription.paymentTerms);

        // Calculate line items and totals
        const grossLine = quantity * plan.price;
        let discountTotal = 0;

        // Apply discount if attached
        if (data.discountIds && data.discountIds.length > 0) {
          const attachedDiscounts = await tx.discount.findMany({
            where: { id: { in: data.discountIds } },
          });
          for (const d of attachedDiscounts) {
            if (d.type === 'PERCENTAGE') {
              discountTotal += MoneyUtil.calculatePercentageDiscount(grossLine, d.value);
            } else {
              discountTotal += Math.min(grossLine, d.value);
            }
          }
        }

        const org = await tx.organization.findUnique({ where: { id: organizationId } });
        const taxRate = org?.taxRate || 0;
        const taxableAmount = Math.max(0, grossLine - discountTotal);
        const taxTotal = MoneyUtil.calculateTax(taxableAmount, taxRate);
        const total = taxableAmount + taxTotal;

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

        invoice = await tx.invoice.create({
          data: {
            organizationId,
            invoiceNumber,
            subscriptionId: subscription.id,
            customerId: customer.id,
            status: initialStatus === 'QUOTATION' ? 'DRAFT' : 'OPEN',
            billingReason: 'SUBSCRIPTION_CREATE',
            currency: subscription.currency,
            subtotal: grossLine,
            discountTotal,
            taxRate,
            taxTotal,
            total,
            amountPaid: 0,
            amountDue: total,
            dueDate,
            customerSnapshot,
            notes: `Initial invoice for subscription ${subscription.subscriptionNumber} (${plan.name})`,
            items: {
              create: [
                {
                  productId: plan.productId,
                  description: `${plan.name} (${plan.product.name}) x ${quantity}`,
                  quantity,
                  unitPrice: plan.price,
                  discountAmount: discountTotal,
                  taxAmount: taxTotal,
                  totalAmount: total,
                },
              ],
            },
          },
        });
      }

      await AuditLogService.record(
        {
          organizationId,
          userId,
          action: 'SUBSCRIPTION_CREATED',
          entity: 'Subscription',
          entityId: subscription.id,
          newValues: {
            subscriptionNumber: subscription.subscriptionNumber,
            planName: plan.name,
            customerEmail: customer.email,
            status: subscription.status,
          },
        },
        tx
      );

      return { subscription, invoice };
    });

    return result;
  }

  static async update(
    organizationId: string,
    id: string,
    data: {
      quantity?: number;
      paymentTerms?: string;
      notes?: string;
      cancelAtPeriodEnd?: boolean;
    },
    userId?: string
  ) {
    const existing = await prisma.subscription.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw AppError.notFound('Subscription not found');
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data,
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'SUBSCRIPTION_UPDATED',
      entity: 'Subscription',
      entityId: id,
      oldValues: existing,
      newValues: updated,
    });

    return updated;
  }

  static async cancel(
    organizationId: string,
    id: string,
    options: { immediate: boolean; reason?: string },
    userId?: string
  ) {
    const subscription = await prisma.subscription.findFirst({
      where: { id, organizationId },
      include: { plan: true },
    });

    if (!subscription) {
      throw AppError.notFound('Subscription not found');
    }

    if (subscription.status === 'CANCELED' || subscription.status === 'EXPIRED') {
      throw AppError.badRequest('Subscription is already canceled or expired.');
    }

    if (options.immediate) {
      const updated = await prisma.subscription.update({
        where: { id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
          renewalDate: null,
          notes: options.reason
            ? `${subscription.notes || ''}\nCancellation Reason: ${options.reason}`
            : subscription.notes,
        },
      });

      await AuditLogService.record({
        organizationId,
        userId,
        action: 'SUBSCRIPTION_CANCELED_IMMEDIATE',
        entity: 'Subscription',
        entityId: id,
        newValues: { status: 'CANCELED', reason: options.reason },
      });

      await NotificationService.create({
        organizationId,
        type: 'SUBSCRIPTION',
        title: `Subscription Canceled: ${subscription.subscriptionNumber}`,
        message: `Subscription ${subscription.subscriptionNumber} was canceled immediately.`,
      });

      return updated;
    } else {
      const updated = await prisma.subscription.update({
        where: { id },
        data: {
          cancelAtPeriodEnd: true,
          notes: options.reason
            ? `${subscription.notes || ''}\nScheduled Cancellation Reason: ${options.reason}`
            : subscription.notes,
        },
      });

      await AuditLogService.record({
        organizationId,
        userId,
        action: 'SUBSCRIPTION_SCHEDULED_CANCELLATION',
        entity: 'Subscription',
        entityId: id,
        newValues: { cancelAtPeriodEnd: true, reason: options.reason },
      });

      return updated;
    }
  }

  static async renew(organizationId: string, id: string, userId?: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        plan: { include: { product: true } },
        discounts: { include: { discount: true } },
      },
    });

    if (!subscription) {
      throw AppError.notFound('Subscription not found');
    }

    if (subscription.status === 'CANCELED' || subscription.status === 'EXPIRED') {
      throw AppError.badRequest('Cannot renew a canceled or expired subscription.');
    }

    // Advance dates
    const currentStart = subscription.currentPeriodEnd;
    const currentEnd = BillingDateUtil.calculatePeriodEnd(
      currentStart,
      subscription.plan.billingInterval,
      subscription.plan.intervalCount
    );

    // Guard against duplicate invoices for this exact period start
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        subscriptionId: id,
        billingReason: 'SUBSCRIPTION_CYCLE',
        dueDate: {
          gte: new Date(currentStart.getTime() - 24 * 60 * 60 * 1000),
          lte: new Date(currentStart.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingInvoice) {
      throw AppError.conflict('An invoice for this renewal cycle has already been generated.');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update subscription dates
      const updatedSub = await tx.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          currentPeriodStart: currentStart,
          currentPeriodEnd: currentEnd,
          renewalDate: currentEnd,
        },
      });

      // Generate invoice
      const invCount = await tx.invoice.count({ where: { organizationId } });
      const invoiceNumber = `INV-${new Date().getFullYear()}-${(invCount + 1).toString().padStart(5, '0')}`;
      const dueDate = BillingDateUtil.calculateDueDate(currentStart, subscription.paymentTerms);

      const grossLine = subscription.quantity * subscription.unitPrice;
      let discountTotal = 0;

      for (const sd of subscription.discounts) {
        if (sd.discount.isActive) {
          if (sd.discount.type === 'PERCENTAGE') {
            discountTotal += MoneyUtil.calculatePercentageDiscount(grossLine, sd.discount.value);
          } else {
            discountTotal += Math.min(grossLine, sd.discount.value);
          }
        }
      }

      const org = await tx.organization.findUnique({ where: { id: organizationId } });
      const taxRate = org?.taxRate || 0;
      const taxable = Math.max(0, grossLine - discountTotal);
      const taxTotal = MoneyUtil.calculateTax(taxable, taxRate);
      const total = taxable + taxTotal;

      const invoice = await tx.invoice.create({
        data: {
          organizationId,
          invoiceNumber,
          subscriptionId: subscription.id,
          customerId: subscription.customerId,
          status: 'OPEN',
          billingReason: 'SUBSCRIPTION_CYCLE',
          currency: subscription.currency,
          subtotal: grossLine,
          discountTotal,
          taxRate,
          taxTotal,
          total,
          amountPaid: 0,
          amountDue: total,
          dueDate,
          customerSnapshot: {
            name: subscription.customer.name,
            email: subscription.customer.email,
            company: subscription.customer.company,
            address: subscription.customer.address,
            taxId: subscription.customer.taxId,
          },
          notes: `Renewal invoice for period ${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`,
          items: {
            create: [
              {
                productId: subscription.plan.productId,
                description: `${subscription.plan.name} (${subscription.plan.product.name}) renewal x ${subscription.quantity}`,
                quantity: subscription.quantity,
                unitPrice: subscription.unitPrice,
                discountAmount: discountTotal,
                taxAmount: taxTotal,
                totalAmount: total,
              },
            ],
          },
        },
      });

      await AuditLogService.record(
        {
          organizationId,
          userId,
          action: 'SUBSCRIPTION_RENEWED',
          entity: 'Subscription',
          entityId: id,
          newValues: {
            newPeriodStart: currentStart,
            newPeriodEnd: currentEnd,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
          },
        },
        tx
      );

      return { subscription: updatedSub, invoice };
    });

    return result;
  }

  static async pause(organizationId: string, id: string, userId?: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { id, organizationId },
      include: { plan: true },
    });

    if (!subscription) {
      throw AppError.notFound('Subscription not found');
    }

    if (!subscription.plan.allowPause) {
      throw AppError.badRequest('This subscription plan does not allow pausing.');
    }

    if (subscription.status !== 'ACTIVE') {
      throw AppError.badRequest(`Cannot pause subscription in '${subscription.status}' state.`);
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        status: 'PAUSED',
        pausedAt: new Date(),
      },
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'SUBSCRIPTION_PAUSED',
      entity: 'Subscription',
      entityId: id,
      newValues: { status: 'PAUSED' },
    });

    return updated;
  }

  static async resume(organizationId: string, id: string, userId?: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { id, organizationId },
    });

    if (!subscription) {
      throw AppError.notFound('Subscription not found');
    }

    if (subscription.status !== 'PAUSED') {
      throw AppError.badRequest('Only paused subscriptions can be resumed.');
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        pausedAt: null,
      },
    });

    await AuditLogService.record({
      organizationId,
      userId,
      action: 'SUBSCRIPTION_RESUMED',
      entity: 'Subscription',
      entityId: id,
      newValues: { status: 'ACTIVE' },
    });

    return updated;
  }
}
