import { z } from 'zod';
import { SubscriptionStatus } from '@prisma/client';

export const createSubscriptionSchema = z.object({
  customerId: z.string().uuid('Customer ID must be a valid UUID'),
  planId: z.string().uuid('Plan ID must be a valid UUID'),
  quantity: z.number().int().min(1).default(1),
  status: z.nativeEnum(SubscriptionStatus).default('ACTIVE'),
  startDate: z.string().datetime().optional(),
  paymentTerms: z.string().default('Due on receipt'),
  notes: z.string().optional(),
  discountIds: z.array(z.string().uuid()).optional(),
  validUntil: z.string().datetime().optional(), // for quotation mode
  generateInitialInvoice: z.boolean().default(true),
});

export const updateSubscriptionSchema = z.object({
  quantity: z.number().int().min(1).optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
});

export const cancelSubscriptionSchema = z.object({
  immediate: z.boolean().default(false),
  reason: z.string().optional(),
});

export const listSubscriptionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(SubscriptionStatus).optional(),
  customerId: z.string().uuid().optional(),
  planId: z.string().uuid().optional(),
  search: z.string().optional(),
});
