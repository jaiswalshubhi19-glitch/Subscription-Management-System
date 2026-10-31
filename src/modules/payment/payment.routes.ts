import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  recordPaymentSchema,
  refundPaymentSchema,
  listPaymentQuerySchema,
} from './payment.validation.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate({ query: listPaymentQuerySchema }),
  PaymentController.list
);

router.post(
  '/',
  requireRole('MEMBER'),
  validate({ body: recordPaymentSchema }),
  PaymentController.recordPayment
);

router.get('/:id', PaymentController.getById);

router.post(
  '/:id/refund',
  requireRole('ADMIN'),
  validate({ body: refundPaymentSchema }),
  PaymentController.refundPayment
);

export default router;
