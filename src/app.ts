import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { generalRateLimiter } from './middlewares/rate-limit.middleware.js';
import { setupSwagger } from './docs/swagger.js';
import { AppError } from './utils/app-error.js';

// Route modules
import authRoutes from './modules/auth/auth.routes.js';
import orgRoutes from './modules/organization/org.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';
import productRoutes from './modules/product/product.routes.js';
import planRoutes from './modules/plan/plan.routes.js';
import subscriptionRoutes from './modules/subscription/subscription.routes.js';
import invoiceRoutes from './modules/invoice/invoice.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import discountRoutes from './modules/discount/discount.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import revenueProtectionRoutes from './modules/revenue-protection/revenue-protection.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import auditLogRoutes from './modules/audit-log/audit-log.routes.js';
import assistantRoutes from './modules/assistant/assistant.routes.js';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers
  app.use(helmet());

  // 2. CORS configuration for frontend
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.indexOf(origin) !== -1 ||
          allowedOrigins.includes('*') ||
          origin.endsWith('.onrender.com') ||
          origin.includes('localhost')
        ) {
          callback(null, true);
        } else {
          callback(new Error('CORS access blocked by policy.'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Body Parsing & Cookies
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // 4. Rate Limiting
  app.use(generalRateLimiter);

  // 5. Swagger API Documentation
  setupSwagger(app);

  // 6. Root & Health Check
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      name: 'SubscriptIQ API Platform',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        health: '/health',
        documentation: '/api-docs',
        apiV1: '/api/v1',
      },
      message: 'SubscriptIQ REST API is up and running. Visit /api-docs for interactive Swagger documentation.',
    });
  });

  const healthHandler = (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      platform: 'SubscriptIQ API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // 7. REST API v1 Routing
  const apiV1 = express.Router();
  apiV1.use('/auth', authRoutes);
  apiV1.use('/', orgRoutes);
  apiV1.use('/customers', customerRoutes);
  apiV1.use('/products', productRoutes);
  apiV1.use('/plans', planRoutes);
  apiV1.use('/subscriptions', subscriptionRoutes);
  apiV1.use('/invoices', invoiceRoutes);
  apiV1.use('/payments', paymentRoutes);
  apiV1.use('/discounts', discountRoutes);
  apiV1.use('/dashboard', dashboardRoutes);
  apiV1.use('/analytics', analyticsRoutes);
  apiV1.use('/revenue-protection', revenueProtectionRoutes);
  apiV1.use('/notifications', notificationRoutes);
  apiV1.use('/audit-logs', auditLogRoutes);
  apiV1.use('/assistant', assistantRoutes);

  app.use('/api/v1', apiV1);

  // 8. 404 Handler
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
  });

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
}
