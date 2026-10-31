import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export const createPaymentAllocationSchema = z.object({
  invoiceId: z.string().uuid('Invoice ID must be a valid UUID'),
  amount: z.number().int().min(1, 'Allocation amount must be at least 1 minor unit (cent)'),
});

export const recordPaymentSchema = z.object({
  customerId: z.string().uuid('Customer ID must be a valid UUID'),
  amount: z.number().int().min(1, 'Payment amount must be at least 1 minor unit (cent)'),
  currency: z.string().min(3).max(3).default('USD'),
  method: z.nativeEnum(PaymentMethod).default('SIMULATED'),
  reference: z.string().optional(),
  idempotencyKey: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().datetime().optional(),
  allocations: z.array(createPaymentAllocationSchema).optional(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().int().min(1).optional(),
  reason: z.string().optional(),
});

export const listPaymentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(PaymentStatus).optional(),
  customerId: z.string().uuid().optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
});
