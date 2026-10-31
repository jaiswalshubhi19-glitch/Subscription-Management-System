import { z } from 'zod';
import { Role } from '@prisma/client';

export const updateOrgSchema = z.object({
  name: z.string().min(2).optional(),
  currency: z.string().min(3).max(3).optional(),
  timezone: z.string().optional(),
  taxRate: z.number().int().min(0).max(10000).optional(), // basis points (1000 = 10%)
  billingAddress: z.record(z.unknown()).optional(),
});

export const inviteTeamMemberSchema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(Role).default('MEMBER'),
  temporaryPassword: z.string().min(8).optional(),
});

export const updateTeamMemberSchema = z.object({
  role: z.nativeEnum(Role),
});
