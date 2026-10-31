import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  listProductQuerySchema,
} from './product.validation.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate({ query: listProductQuerySchema }),
  ProductController.list
);

router.post(
  '/',
  requireRole('ADMIN'),
  validate({ body: createProductSchema }),
  ProductController.create
);

router.get('/:id', ProductController.getById);

router.patch(
  '/:id',
  requireRole('ADMIN'),
  validate({ body: updateProductSchema }),
  ProductController.update
);

router.delete(
  '/:id',
  requireRole('ADMIN'),
  ProductController.delete
);

export default router;
