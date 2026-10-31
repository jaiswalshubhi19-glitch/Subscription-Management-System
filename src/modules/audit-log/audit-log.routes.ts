import { Router } from 'express';
import { AuditLogController } from './audit-log.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// Viewing audit logs requires ADMIN or OWNER
router.get('/', requireRole('ADMIN'), AuditLogController.list);

export default router;
