import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SubscriptIQ REST API',
    version: '1.0.0',
    description:
      'Production-minded REST API for SubscriptIQ — an intelligent subscription management and revenue protection platform. Enforces multi-tenancy, organization isolation, and integer minor currency units.',
    contact: {
      name: 'SubscriptIQ Platform Engineering',
      email: 'engineering@brightloop.local',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 root endpoint',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'subscriptiq_token',
        description: 'Secure HTTP-only authentication cookie',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Bearer JWT token header',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          meta: { type: 'object' },
          message: { type: 'string' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              statusCode: { type: 'integer' },
              code: { type: 'string' },
              details: { type: 'object' },
            },
          },
        },
      },
    },
  },
  security: [{ cookieAuth: [] }, { bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register organization and first admin (OWNER)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name', 'organizationName'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@brightloop.local' },
                  password: { type: 'string', format: 'password', example: 'Brightloop@2026' },
                  name: { type: 'string', example: 'Brightloop Admin' },
                  organizationName: { type: 'string', example: 'Brightloop Software' },
                  currency: { type: 'string', example: 'USD' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful' },
          400: { description: 'Validation error' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log into account and receive secure HTTP-only cookie',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@brightloop.local' },
                  password: { type: 'string', format: 'password', example: 'Brightloop@2026' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Logged in successfully' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out and clear session cookie',
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user profile, active organization and role',
        responses: {
          200: { description: 'User profile retrieved' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/organization': {
      get: {
        tags: ['Organization & Team'],
        summary: 'Get active organization details and summary metrics',
        responses: {
          200: { description: 'Organization retrieved' },
        },
      },
      patch: {
        tags: ['Organization & Team'],
        summary: 'Update organization settings (taxRate, timezone, name, currency)',
        responses: {
          200: { description: 'Organization updated' },
        },
      },
    },
    '/team': {
      get: {
        tags: ['Organization & Team'],
        summary: 'List team members and their roles',
        responses: {
          200: { description: 'Team members retrieved' },
        },
      },
    },
    '/team/invitations': {
      post: {
        tags: ['Organization & Team'],
        summary: 'Invite a new team member with specific role',
        responses: {
          201: { description: 'Member invited' },
        },
      },
    },
    '/team/{memberId}': {
      patch: {
        tags: ['Organization & Team'],
        summary: 'Update team member role (requires ADMIN or OWNER)',
        parameters: [{ name: 'memberId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Role updated' },
        },
      },
    },
    '/customers': {
      get: {
        tags: ['Customers'],
        summary: 'List customers with pagination and search',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Customer list retrieved' } },
      },
      post: {
        tags: ['Customers'],
        summary: 'Create customer',
        responses: { 201: { description: 'Customer created' } },
      },
    },
    '/customers/{id}': {
      get: {
        tags: ['Customers'],
        summary: 'Get customer details by ID with subscriptions and invoices',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Customer details retrieved' } },
      },
      patch: {
        tags: ['Customers'],
        summary: 'Update customer details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Customer updated' } },
      },
      delete: {
        tags: ['Customers'],
        summary: 'Delete customer (only if no subscriptions or invoices exist)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Customer deleted' } },
      },
    },
    '/products': {
      get: {
        tags: ['Products & Plans'],
        summary: 'List products with active plans and variants',
        responses: { 200: { description: 'Products retrieved' } },
      },
      post: {
        tags: ['Products & Plans'],
        summary: 'Create product with pricing in minor units (cents)',
        responses: { 201: { description: 'Product created' } },
      },
    },
    '/plans': {
      get: {
        tags: ['Products & Plans'],
        summary: 'List recurring subscription pricing plans',
        responses: { 200: { description: 'Plans retrieved' } },
      },
      post: {
        tags: ['Products & Plans'],
        summary: 'Create subscription plan (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY)',
        responses: { 201: { description: 'Plan created' } },
      },
    },
    '/subscriptions': {
      get: {
        tags: ['Subscriptions'],
        summary: 'List subscriptions with status filter and search',
        responses: { 200: { description: 'Subscriptions retrieved' } },
      },
      post: {
        tags: ['Subscriptions'],
        summary: 'Create subscription contract or quotation and optionally generate initial invoice',
        responses: { 201: { description: 'Subscription created' } },
      },
    },
    '/subscriptions/{id}/cancel': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Cancel subscription immediately or at period end',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Cancellation processed' } },
      },
    },
    '/subscriptions/{id}/renew': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Renew subscription contract and generate next cycle invoice atomically',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Subscription renewed' } },
      },
    },
    '/subscriptions/{id}/pause': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Pause active subscription',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Subscription paused' } },
      },
    },
    '/subscriptions/{id}/resume': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Resume paused subscription',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Subscription resumed' } },
      },
    },
    '/invoices': {
      get: {
        tags: ['Invoices'],
        summary: 'List invoices with filtering and pagination',
        responses: { 200: { description: 'Invoices retrieved' } },
      },
      post: {
        tags: ['Invoices'],
        summary: 'Create invoice with line items, tax, and customer snapshot',
        responses: { 201: { description: 'Invoice created' } },
      },
    },
    '/invoices/{id}/void': {
      post: {
        tags: ['Invoices'],
        summary: 'Void an invoice',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Invoice voided' } },
      },
    },
    '/payments': {
      get: {
        tags: ['Payments'],
        summary: 'List recorded payments and invoice allocations',
        responses: { 200: { description: 'Payments retrieved' } },
      },
      post: {
        tags: ['Payments'],
        summary: 'Record payment with idempotency key and multi-invoice allocations',
        responses: { 201: { description: 'Payment recorded and invoices updated' } },
      },
    },
    '/discounts': {
      get: {
        tags: ['Discounts'],
        summary: 'List discount rules (percentage basis points or fixed amounts)',
        responses: { 200: { description: 'Discounts retrieved' } },
      },
      post: {
        tags: ['Discounts'],
        summary: 'Create discount rule with quantity or usage constraints',
        responses: { 201: { description: 'Discount created' } },
      },
    },
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard & Analytics'],
        summary: 'Executive dashboard metrics (MRR, ARR, churn rate, active contracts, uncollected dues)',
        responses: { 200: { description: 'Dashboard summary retrieved' } },
      },
    },
    '/analytics/revenue': {
      get: {
        tags: ['Dashboard & Analytics'],
        summary: 'Billed vs Collected revenue trend data over selectable months',
        responses: { 200: { description: 'Revenue analytics retrieved' } },
      },
    },
    '/revenue-protection/overview': {
      get: {
        tags: ['Revenue Protection'],
        summary: 'Summary of detected revenue leaks, overdue risk, and inconsistencies',
        responses: { 200: { description: 'Overview retrieved' } },
      },
    },
    '/revenue-protection/issues': {
      get: {
        tags: ['Revenue Protection'],
        summary: 'List detected revenue protection issues with severity and status filters',
        responses: { 200: { description: 'Issues list retrieved' } },
      },
    },
    '/revenue-protection/renewals': {
      get: {
        tags: ['Revenue Protection'],
        summary: 'Upcoming renewals within next 30 days flagged with churn risk assessment',
        responses: { 200: { description: 'Upcoming renewals retrieved' } },
      },
    },
    '/revenue-protection/issues/{id}/resolve': {
      post: {
        tags: ['Revenue Protection'],
        summary: 'Resolve or dismiss revenue leak issue with resolution notes',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Issue resolved' } },
      },
    },
    '/revenue-protection/scan': {
      post: {
        tags: ['Revenue Protection'],
        summary: 'Run on-demand deterministic revenue leak and math integrity audit',
        responses: { 200: { description: 'Audit completed' } },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications for current organization and user',
        responses: { 200: { description: 'Notifications retrieved' } },
      },
    },
    '/assistant/chat': {
      post: {
        tags: ['AI Business Assistant'],
        summary: 'Ask natural-language business questions backed by verified database context',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', example: 'What is our current MRR and how much revenue is at risk?' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'AI explanation generated with verified metrics' },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiSpec);
  });
}
