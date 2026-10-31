import { z } from 'zod';
import { ProductType } from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
  description: z.string().optional(),
  type: z.nativeEnum(ProductType).default('SOFTWARE'),
  salesPrice: z.number().int().min(0, 'Sales price must be positive minor units (cents)'),
  costPrice: z.number().int().min(0).default(0),
  notes: z.string().optional(),
  variants: z.array(z.record(z.unknown())).optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.nativeEnum(ProductType).optional(),
});
