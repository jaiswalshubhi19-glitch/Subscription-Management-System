import { Router } from 'express';
import { SubscriptionController } from './subscription.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  cancelSubscriptionSchema,
  listSubscriptionQuerySchema,
} from './subscription.validation.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate({ query: listSubscriptionQuerySchema }),
  SubscriptionController.list
);

router.post(
  '/',
  requireRole('MEMBER'),
  validate({ body: createSubscriptionSchema }),
  SubscriptionController.create
);

router.get('/:id', SubscriptionController.getById);

router.patch(
  '/:id',
  requireRole('MEMBER'),
  validate({ body: updateSubscriptionSchema }),
  SubscriptionController.update
);

router.post(
  '/:id/cancel',
  requireRole('MEMBER'),
  validate({ body: cancelSubscriptionSchema }),
  SubscriptionController.cancel
);

router.post(
  '/:id/renew',
  requireRole('MEMBER'),
  SubscriptionController.renew
);

router.post(
  '/:id/pause',
  requireRole('MEMBER'),
  SubscriptionController.pause
);

router.post(
  '/:id/resume',
  requireRole('MEMBER'),
  SubscriptionController.resume
);

export default router;
