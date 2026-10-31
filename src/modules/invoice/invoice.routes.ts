import { Router } from 'express';
import { InvoiceController } from './invoice.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createInvoiceSchema,
  listInvoiceQuerySchema,
} from './invoice.validation.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate({ query: listInvoiceQuerySchema }),
  InvoiceController.list
);

router.post(
  '/',
  requireRole('MEMBER'),
  validate({ body: createInvoiceSchema }),
  InvoiceController.create
);

router.get('/:id', InvoiceController.getById);

router.post(
  '/:id/void',
  requireRole('ADMIN'),
  InvoiceController.voidInvoice
);

export default router;
