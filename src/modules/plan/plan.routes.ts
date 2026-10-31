import { Router } from 'express';
import { PlanController } from './plan.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createPlanSchema,
  updatePlanSchema,
  listPlanQuerySchema,
} from './plan.validation.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate({ query: listPlanQuerySchema }),
  PlanController.list
);

router.post(
  '/',
  requireRole('ADMIN'),
  validate({ body: createPlanSchema }),
  PlanController.create
);

router.get('/:id', PlanController.getById);

router.patch(
  '/:id',
  requireRole('ADMIN'),
  validate({ body: updatePlanSchema }),
  PlanController.update
);

router.delete(
  '/:id',
  requireRole('ADMIN'),
  PlanController.delete
);

export default router;
