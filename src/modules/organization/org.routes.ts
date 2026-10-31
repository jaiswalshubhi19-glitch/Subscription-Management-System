import { Router } from 'express';
import { OrgController } from './org.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  updateOrgSchema,
  inviteTeamMemberSchema,
  updateTeamMemberSchema,
} from './org.validation.js';

const router = Router();

// Organization endpoints
router.get('/organization', authenticate, OrgController.getOrganization);
router.patch(
  '/organization',
  authenticate,
  requireRole('ADMIN'),
  validate({ body: updateOrgSchema }),
  OrgController.updateOrganization
);

// Team endpoints
router.get('/team', authenticate, OrgController.listTeam);
router.post(
  '/team/invitations',
  authenticate,
  requireRole('ADMIN'),
  validate({ body: inviteTeamMemberSchema }),
  OrgController.inviteMember
);
router.patch(
  '/team/:memberId',
  authenticate,
  requireRole('ADMIN'),
  validate({ body: updateTeamMemberSchema }),
  OrgController.updateMemberRole
);

export default router;
