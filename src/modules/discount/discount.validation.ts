import { z } from 'zod';
import { DiscountScope, DiscountType } from '@prisma/client';

export const createDiscountSchema = z.object({
  code: z.string().min(2, 'Discount code must be at least 2 characters').toUpperCase(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.nativeEnum(DiscountType).default('PERCENTAGE'),
  value: z.number().int().min(1, 'Value must be positive. If percentage, in basis points (1000 = 10%), if fixed, in minor units (cents).'),
  currency: z.string().min(3).max(3).optional(),
  appliesTo: z.nativeEnum(DiscountScope).default('WHOLE_SUBSCRIPTION'),
  productId: z.string().uuid().optional(),
  minPurchaseAmount: z.number().int().min(0).optional(),
  minQuantity: z.number().int().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  maxUses: z.number().int().min(1).optional(),
  isActive: z.boolean().default(true),
});

export const updateDiscountSchema = createDiscountSchema.partial();

export const listDiscountQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});
