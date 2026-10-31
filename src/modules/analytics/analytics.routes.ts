import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/revenue', AnalyticsController.getRevenue);
router.get('/subscriptions', AnalyticsController.getSubscriptions);
router.get('/customers', AnalyticsController.getCustomers);
router.get('/churn', AnalyticsController.getChurn);

export default router;
