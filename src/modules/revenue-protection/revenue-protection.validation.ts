import { z } from 'zod';
import { IssueSeverity, IssueStatus, ProtectionIssueType } from '@prisma/client';

export const resolveIssueSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED', 'INVESTIGATING']).default('RESOLVED'),
  resolutionNotes: z.string().min(2, 'Resolution notes are required to document the action taken'),
});

export const listIssuesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(IssueStatus).optional(),
  severity: z.nativeEnum(IssueSeverity).optional(),
  issueType: z.nativeEnum(ProtectionIssueType).optional(),
});
