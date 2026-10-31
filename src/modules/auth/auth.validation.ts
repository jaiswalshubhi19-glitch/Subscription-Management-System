import { z } from 'zod';

// Strong password regex: > 8 chars, 1 uppercase, 1 lowercase, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,}$/;

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(9, 'Password must be more than 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one special character'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters long'),
  currency: z.string().min(3).max(3).default('USD'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const switchOrgSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID format'),
});
