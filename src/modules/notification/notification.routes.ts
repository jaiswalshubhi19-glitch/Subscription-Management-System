import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.list);
router.patch('/:id/read', NotificationController.markAsRead);
router.post('/read-all', NotificationController.markAllAsRead);

export default router;
