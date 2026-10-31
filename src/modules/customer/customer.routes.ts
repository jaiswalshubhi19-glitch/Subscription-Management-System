import { Router } from 'express';
import { CustomerController } from './customer.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomerQuerySchema,
} from './customer.validation.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate({ query: listCustomerQuerySchema }),
  CustomerController.list
);

router.post(
  '/',
  requireRole('MEMBER'),
  validate({ body: createCustomerSchema }),
  CustomerController.create
);

router.get('/:id', CustomerController.getById);

router.patch(
  '/:id',
  requireRole('MEMBER'),
  validate({ body: updateCustomerSchema }),
  CustomerController.update
);

router.delete(
  '/:id',
  requireRole('ADMIN'),
  CustomerController.delete
);

export default router;
