import { z } from 'zod';
import { BillingInterval } from '@prisma/client';

export const createPlanSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  name: z.string().min(2, 'Plan name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
  description: z.string().optional(),
  billingInterval: z.nativeEnum(BillingInterval).default('MONTHLY'),
  intervalCount: z.number().int().min(1).default(1),
  price: z.number().int().min(0, 'Plan price must be non-negative minor units (cents)'),
  currency: z.string().min(3).max(3).default('USD'),
  trialPeriodDays: z.number().int().min(0).default(0),
  minQuantity: z.number().int().min(1).default(1),
  maxQuantity: z.number().int().min(1).optional(),
  autoCloseOnExpiry: z.boolean().default(false),
  allowEarlyCancellation: z.boolean().default(true),
  allowPause: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

export const updatePlanSchema = createPlanSchema.partial().omit({ productId: true });

export const listPlanQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  productId: z.string().uuid().optional(),
  billingInterval: z.nativeEnum(BillingInterval).optional(),
  search: z.string().optional(),
});
