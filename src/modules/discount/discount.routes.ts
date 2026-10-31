import { Router } from 'express';
import { DiscountController } from './discount.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createDiscountSchema,
  updateDiscountSchema,
  listDiscountQuerySchema,
} from './discount.validation.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate({ query: listDiscountQuerySchema }),
  DiscountController.list
);

router.post(
  '/',
  requireRole('ADMIN'),
  validate({ body: createDiscountSchema }),
  DiscountController.create
);

router.get('/:id', DiscountController.getById);

router.patch(
  '/:id',
  requireRole('ADMIN'),
  validate({ body: updateDiscountSchema }),
  DiscountController.update
);

router.delete(
  '/:id',
  requireRole('ADMIN'),
  DiscountController.delete
);

export default router;
