import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client.js';
import { AppError } from '../../utils/app-error.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { NotificationService } from '../notification/notification.service.js';

export interface PaymentAllocationInput {
  invoiceId: string;
  amount: number;
}

export interface RecordPaymentInput {
  customerId: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  reference?: string;
  idempotencyKey?: string;
  notes?: string;
  paidAt?: string;
  allocations?: PaymentAllocationInput[];
}

export class PaymentService {
  static async list(
    organizationId: string,
    options: {
      page: number;
      limit: number;
      status?: PaymentStatus;
      customerId?: string;
      method?: PaymentMethod;
    }
  ) {
    const skip = (options.page - 1) * options.limit;

    const where: Prisma.PaymentWhereInput = {
      organizationId,
      ...(options.status ? { status: options.status } : {}),
      ...(options.customerId ? { customerId: options.customerId } : {}),
      ...(options.method ? { method: options.method } : {}),
    };

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { paidAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true, customerNumber: true },
          },
          allocations: {
            include: {
              invoice: {
                select: { id: true, invoiceNumber: true, total: true, status: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      payments,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  static async getById(organizationId: string, id: string) {
    const payment = await prisma.payment.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        allocations: {
          include: {
            invoice: {
              include: { items: true },
            },
          },
        },
      },
    });

    if (!payment) {
      throw AppError.notFound('Payment not found');
    }

    return payment;
  }

  static async recordPayment(
    organizationId: string,
    data: RecordPaymentInput,
    userId?: string
  ) {
    // 1. Idempotency Check
    if (data.idempotencyKey) {
      const existing = await prisma.payment.findUnique({
        where: {
          organizationId_idempotencyKey: {
            organizationId,
            idempotencyKey: data.idempotencyKey,
          },
        },
        include: { allocations: true },
      });
      if (existing) {
        return existing; // Return previously executed payment idempotent response
      }
    }

    // 2. Verify Customer
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, organizationId },
    });
    if (!customer) {
      throw AppError.notFound('Customer not found in this organization');
    }

    // 3. Verify Allocations
    if (data.allocations && data.allocations.length > 0) {
      let totalAllocated = 0;
      for (const alloc of data.allocations) {
        totalAllocated += alloc.amount;
        const inv = await prisma.invoice.findFirst({
          where: { id: alloc.invoiceId, organizationId, customerId: customer.id },
        });

        if (!inv) {
          throw AppError.badRequest(`Invoice ${alloc.invoiceId} does not exist or does not belong to this customer.`);
        }

        if (inv.status === 'VOID') {
          throw AppError.badRequest(`Cannot allocate payment to voided invoice ${inv.invoiceNumber}.`);
        }

        if (alloc.amount > inv.amountDue) {
          throw AppError.badRequest(
            `Allocated amount (${alloc.amount}) exceeds remaining balance due (${inv.amountDue}) on invoice ${inv.invoiceNumber}.`
          );
        }
      }

      if (totalAllocated > data.amount) {
        throw AppError.badRequest(
          `Total allocated sum (${totalAllocated}) cannot exceed total payment amount (${data.amount}).`
        );
      }
    }

    // Generate unique payment number
    const pCount = await prisma.payment.count({ where: { organizationId } });
    const paymentNumber = `PAY-${new Date().getFullYear()}-${(pCount + 1).toString().padStart(5, '0')}`;

    // 4. Atomic Execution
    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          organizationId,
          customerId: customer.id,
          paymentNumber,
          amount: data.amount,
          currency: data.currency?.toUpperCase() || 'USD',
          status: 'SUCCEEDED',
          method: data.method,
          reference: data.reference,
          idempotencyKey: data.idempotencyKey,
          notes: data.notes,
          paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        },
      });

      // Handle allocations
      if (data.allocations && data.allocations.length > 0) {
        for (const alloc of data.allocations) {
          await tx.paymentAllocation.create({
            data: {
              paymentId: createdPayment.id,
              invoiceId: alloc.invoiceId,
              amount: alloc.amount,
            },
          });

          // Update invoice state
          const inv = await tx.invoice.findUniqueOrThrow({
            where: { id: alloc.invoiceId },
          });

          const newAmountPaid = inv.amountPaid + alloc.amount;
          const newAmountDue = Math.max(0, inv.total - newAmountPaid);
          const newStatus = newAmountDue === 0 ? 'PAID' : inv.status;
          const paidAt = newAmountDue === 0 ? new Date() : inv.paidAt;

          await tx.invoice.update({
            where: { id: alloc.invoiceId },
            data: {
              amountPaid: newAmountPaid,
              amountDue: newAmountDue,
              status: newStatus,
              paidAt,
            },
          });

          // If linked subscription is PAST_DUE and invoice is now paid, recover to ACTIVE
          if (inv.subscriptionId && newStatus === 'PAID') {
            const remainingOverdue = await tx.invoice.count({
              where: {
                subscriptionId: inv.subscriptionId,
                status: 'OVERDUE',
              },
            });

            if (remainingOverdue === 0) {
              await tx.subscription.updateMany({
                where: { id: inv.subscriptionId, status: 'PAST_DUE' },
                data: { status: 'ACTIVE' },
              });
            }
          }
        }
      }

      await AuditLogService.record(
        {
          organizationId,
          userId,
          action: 'PAYMENT_RECORDED',
          entity: 'Payment',
          entityId: createdPayment.id,
          newValues: {
            paymentNumber: createdPayment.paymentNumber,
            amount: createdPayment.amount,
            method: createdPayment.method,
          },
        },
        tx
      );

      await NotificationService.create(
        {
          organizationId,
          type: 'BILLING',
          title: `Payment Received: ${createdPayment.paymentNumber}`,
          message: `Recorded payment of ${createdPayment.amount / 100} ${createdPayment.currency} for customer ${customer.name}.`,
        },
        tx
      );

      return createdPayment;
    });

    return payment;
  }

  static async refundPayment(
    organizationId: string,
    id: string,
    data: { amount?: number; reason?: string },
    userId?: string
  ) {
    const payment = await prisma.payment.findFirst({
      where: { id, organizationId },
      include: { allocations: true },
    });

    if (!payment) {
      throw AppError.notFound('Payment not found');
    }

    if (payment.status === 'REFUNDED') {
      throw AppError.badRequest('Payment has already been fully refunded.');
    }

    const refundAmount = data.amount || payment.amount;
    if (refundAmount > payment.amount) {
      throw AppError.badRequest('Refund amount cannot exceed original payment amount.');
    }

    const newStatus: PaymentStatus =
      refundAmount === payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

    const updated = await prisma.$transaction(async (tx) => {
      // Revert invoice allocations proportionally or fully
      for (const alloc of payment.allocations) {
        const inv = await tx.invoice.findUnique({ where: { id: alloc.invoiceId } });
        if (inv) {
          const updatedPaid = Math.max(0, inv.amountPaid - alloc.amount);
          const updatedDue = inv.total - updatedPaid;
          await tx.invoice.update({
            where: { id: inv.id },
            data: {
              amountPaid: updatedPaid,
              amountDue: updatedDue,
              status: updatedDue > 0 ? 'OPEN' : 'PAID',
            },
          });
        }
      }

      const p = await tx.payment.update({
        where: { id },
        data: {
          status: newStatus,
          notes: data.reason
            ? `${payment.notes || ''}\nRefund Reason: ${data.reason}`
            : payment.notes,
        },
      });

      await AuditLogService.record(
        {
          organizationId,
          userId,
          action: 'PAYMENT_REFUNDED',
          entity: 'Payment',
          entityId: id,
          newValues: { status: newStatus, refundAmount, reason: data.reason },
        },
        tx
      );

      return p;
    });

    return updated;
  }
}
