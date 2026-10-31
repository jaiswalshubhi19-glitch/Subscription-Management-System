import { Router } from 'express';
import { RevenueProtectionController } from './revenue-protection.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  resolveIssueSchema,
  listIssuesQuerySchema,
} from './revenue-protection.validation.js';

const router = Router();

router.use(authenticate);

router.get('/overview', RevenueProtectionController.getOverview);

router.get(
  '/issues',
  validate({ query: listIssuesQuerySchema }),
  RevenueProtectionController.listIssues
);

router.get('/renewals', RevenueProtectionController.getUpcomingRenewals);

router.post(
  '/issues/:id/resolve',
  requireRole('MEMBER'),
  validate({ body: resolveIssueSchema }),
  RevenueProtectionController.resolveIssue
);

router.post(
  '/scan',
  requireRole('ADMIN'),
  RevenueProtectionController.runScan
);

export default router;
