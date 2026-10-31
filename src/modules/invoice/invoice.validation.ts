import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const createInvoiceItemSchema = z.object({
  productId: z.string().uuid().optional(),
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().int().min(0, 'Unit price in minor units (cents)'),
  discountAmount: z.number().int().min(0).default(0),
  taxAmount: z.number().int().min(0).default(0),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().uuid('Customer ID must be a valid UUID'),
  subscriptionId: z.string().uuid().optional(),
  dueDate: z.string().datetime(),
  items: z.array(createInvoiceItemSchema).min(1, 'Invoice must have at least one line item'),
  notes: z.string().optional(),
  currency: z.string().min(3).max(3).default('USD'),
  status: z.nativeEnum(InvoiceStatus).default('OPEN'),
});

export const listInvoiceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(InvoiceStatus).optional(),
  customerId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  search: z.string().optional(),
});
