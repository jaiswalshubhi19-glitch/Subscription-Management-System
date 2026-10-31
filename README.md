# SubscriptIQ — Backend Platform

> **Intelligent Subscription Management and Revenue Protection Platform**

SubscriptIQ is a production-minded backend for recurring billing, subscription lifecycle management, and deterministic revenue leak protection. Built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM, it replaces frontend mock data with secure, multi-tenant REST APIs.

---

## 1. Key Highlights & Architectural Guarantees

- **Organization Multi-Tenancy & Isolation**: Every business record is scoped to an `organizationId`. Client-supplied organization IDs are never trusted—organization context is securely derived from verified session membership on every request.
- **Integer Minor Units (Zero Floating-Point Math)**: All currency amounts (sales prices, discounts, line totals, invoices, tax calculations, payments) are strictly stored and computed as integer minor units (cents, paise) and basis points (e.g., `1000` = `10.00%`).
- **Immutable Invoice Snapshots**: Historical invoices preserve frozen snapshots of customer details, product lines, and tax rules at issuance time, ensuring subsequent catalog edits never rewrite historical financial records.
- **Atomic Financial Transactions**: Multi-step operations (invoice generation, payment recording, multi-invoice allocations, subscription recovery) execute inside atomic database transactions (`prisma.$transaction`).
- **Idempotency Keys**: Payment operations support client-provided `idempotencyKey` values to prevent duplicate charges or double recording during network retries.
- **Deterministic Revenue Protection**: Seven automated backend audit checks continuously monitor unpaid overdue invoices, past-due contracts, duplicate invoices, duplicate payments, expiring discounts, and line item math discrepancies without relying on black-box heuristics.
- **Dual-Mode AI Business Assistant**: Isolated `AIProvider` architecture integrating Grok (xAI) with resilient fallback to a deterministic, zero-hallucination rule-based assistant that operates exclusively on verified database metrics.
- **Role-Based Access Control (RBAC)**: Role hierarchy (`OWNER` > `ADMIN` > `MEMBER` > `VIEWER`) guarding sensitive endpoints (team management, pricing catalog, financial voiding, audit logs).

---

## 2. Technology Stack

- **Runtime**: Node.js (v24+)
- **Framework**: Express 4.x
- **Language**: TypeScript (strict mode, ES2022)
- **Database**: PostgreSQL
- **ORM & Migrations**: Prisma ORM 5.x
- **Validation**: Zod (request body, params, and query schemas)
- **Authentication**: JWT stored in secure HTTP-only cookies (`subscriptiq_token`) + optional `Authorization: Bearer` header
- **Security**: Helmet headers, CORS with credentials, express-rate-limit
- **Documentation**: OpenAPI 3.0 + Swagger UI (`/api-docs`)
- **Testing**: Vitest + Supertest

---

## 3. Directory Structure

```text
├── docker-compose.yml          # PostgreSQL & PgAdmin setup
├── package.json
├── tsconfig.json
├── .env.example
├── prisma/
│   ├── schema.prisma           # 15 relational models, enums & constraints
│   ├── migrations/             # SQL migrations
│   └── seed.ts                 # Realistic Brightloop demo dataset
├── src/
│   ├── server.ts               # HTTP bootstrap and graceful shutdown
│   ├── app.ts                  # Express application setup, middlewares, routes
│   ├── config/
│   │   ├── env.ts              # Zod-validated environment configuration
│   │   └── constants.ts        # Roles, hierarchies, cookie constants
│   ├── prisma/
│   │   └── client.ts           # Prisma singleton client with logging
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # Cookie/Bearer JWT verification & org extraction
│   │   ├── rbac.middleware.ts  # Role authorization (OWNER, ADMIN, MEMBER, VIEWER)
│   │   ├── validate.middleware.ts # Zod request validation
│   │   ├── rate-limit.middleware.ts # Auth & AI rate limiting
│   │   └── error.middleware.ts # Centralized operational & database error handling
│   ├── modules/
│   │   ├── auth/               # Register, Login, Logout, Current User
│   │   ├── organization/       # Org settings, Team invitations, Role assignment
│   │   ├── customer/           # Customer profiles, balances, history
│   │   ├── product/            # Products, variants (e.g. Odoo brand connector)
│   │   ├── plan/               # Recurring billing intervals (Daily, Monthly, Yearly)
│   │   ├── subscription/       # Lifecycle, renewals, pausing, cancellation
│   │   ├── invoice/            # Line items, tax calculations, voiding, snapshots
│   │   ├── payment/            # Payments, multi-invoice allocations, refunds
│   │   ├── discount/           # Percentage/Fixed discount rules & vouchers
│   │   ├── dashboard/          # MRR, ARR, churn, uncollected dues summary
│   │   ├── analytics/          # Billed vs Collected revenue trends, plan breakdown
│   │   ├── revenue-protection/ # Deterministic leak detection & issue resolution
│   │   ├── notification/       # Billing and system notifications
│   │   ├── audit-log/          # Immutable mutation audit trails
│   │   └── assistant/          # Natural-language business assistant (Grok/Mock)
│   ├── utils/
│   │   ├── money.ts            # Integer minor unit and basis point calculations
│   │   ├── billing-dates.ts    # Date calculation for recurring intervals
│   │   ├── app-error.ts        # Typed application errors with HTTP codes
│   │   ├── response.ts         # Standard API response wrappers
│   │   └── logger.ts           # Structured logger with automatic PII redaction
│   └── docs/
│       └── swagger.ts          # OpenAPI 3.0 specification & Swagger UI
└── tests/
    ├── unit/
    │   ├── money.test.ts       # Zero floating-point math validation
    │   ├── billing-dates.test.ts # Interval calculation tests
    │   ├── rbac.test.ts        # Role boundaries & permissions tests
    │   └── revenue-protection.test.ts # Discount constraints & leak tests
    └── integration/
        └── api.test.ts         # Health checks, OpenAPI spec, and 401/404 handling
```

---

## 4. Quickstart Guide

### Prerequisites

- Node.js v18+ (tested on Node.js v24)
- PostgreSQL (or Docker)

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Review the values:
```ini
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/subscriptiq?schema=public"
JWT_SECRET="subscriptiq-production-secure-jwt-key-at-least-32-characters"
COOKIE_SECRET="subscriptiq-secure-cookie-secret-key-32-characters"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```

### 3. Spin up PostgreSQL (Optional if Docker is installed)

```bash
docker compose up -d
```

*This spins up PostgreSQL on port `5432` and PgAdmin on `http://localhost:5050`.*

### 4. Run Migrations & Seed Data

Generate Prisma types and apply schema:

```bash
npm run prisma:generate
npm run prisma:push      # or: npm run prisma:migrate
npm run prisma:seed
```

### 5. Start the Server

```bash
# Development mode with live reload
npm run dev

# Production build and run
npm run build
npm start
```

The API will be live at:
- **API Base**: `http://localhost:4000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:4000/api-docs`
- **OpenAPI JSON Spec**: `http://localhost:4000/api-docs.json`
- **Health Check**: `http://localhost:4000/health`

### 6. Run Automated Tests

```bash
npm test
```

---

## 5. Seed Demo Credentials (Brightloop Software)

The database seed provides a realistic scenario matching Brightloop Software:

| Name | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Brightloop Admin** | `admin@brightloop.local` | `Brightloop@2026` | `OWNER` | Full system control |
| **Sarah Finance Lead** | `sarah.finance@brightloop.local` | `Brightloop@2026` | `ADMIN` | Finance, pricing, audits |
| **Alex Sales Rep** | `alex.sales@brightloop.local` | `Brightloop@2026` | `MEMBER` | Day-to-day customer sales |

---

## 6. REST API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new organization and first OWNER admin | Public |
| `POST` | `/auth/login` | Log in and receive secure HTTP-only cookie | Public |
| `POST` | `/auth/logout` | Log out and clear session cookie | Authenticated |
| `GET` | `/auth/me` | Get current user, active organization, and role | Authenticated |

### Organization & Team
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/organization` | View organization details and record counts | Authenticated |
| `PATCH` | `/organization` | Update organization settings (tax rate, timezone) | ADMIN+ |
| `GET` | `/team` | List team members and assigned roles | Authenticated |
| `POST` | `/team/invitations` | Invite a new team member | ADMIN+ |
| `PATCH` | `/team/:memberId` | Update member role | ADMIN+ |

### Customers
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/customers` | List customers (search, pagination) | Authenticated |
| `POST` | `/customers` | Create a customer | MEMBER+ |
| `GET` | `/customers/:id` | Get customer details, subscriptions, invoices | Authenticated |
| `PATCH` | `/customers/:id` | Update customer info | MEMBER+ |
| `DELETE` | `/customers/:id` | Delete customer (if no invoices or contracts) | ADMIN+ |

### Products & Plans
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | List products and variant pricing | Authenticated |
| `POST` | `/products` | Create product | ADMIN+ |
| `GET` | `/products/:id` | Get product by ID | Authenticated |
| `PATCH` | `/products/:id` | Update product | ADMIN+ |
| `DELETE` | `/products/:id` | Delete product (if no plans or invoice lines) | ADMIN+ |
| `GET` | `/plans` | List recurring subscription plans | Authenticated |
| `POST` | `/plans` | Create plan (Daily, Weekly, Monthly, Yearly) | ADMIN+ |
| `GET` | `/plans/:id` | Get plan by ID | Authenticated |
| `PATCH` | `/plans/:id` | Update plan | ADMIN+ |
| `DELETE` | `/plans/:id` | Delete plan (if no subscriptions attached) | ADMIN+ |

### Subscriptions & Renewals
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/subscriptions` | List subscriptions (filter by status, customer) | Authenticated |
| `POST` | `/subscriptions` | Create subscription contract & initial invoice | MEMBER+ |
| `GET` | `/subscriptions/:id` | Get subscription details with invoices | Authenticated |
| `PATCH` | `/subscriptions/:id` | Update subscription quantity or terms | MEMBER+ |
| `POST` | `/subscriptions/:id/cancel` | Cancel immediately or at period end | MEMBER+ |
| `POST` | `/subscriptions/:id/renew` | Advance renewal period & generate cycle invoice | MEMBER+ |
| `POST` | `/subscriptions/:id/pause` | Pause active subscription | MEMBER+ |
| `POST` | `/subscriptions/:id/resume` | Resume paused subscription | MEMBER+ |

### Invoices
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/invoices` | List invoices (filter by status, customer) | Authenticated |
| `POST` | `/invoices` | Create invoice with line items and tax | MEMBER+ |
| `GET` | `/invoices/:id` | Get invoice with customer snapshot & allocations | Authenticated |
| `POST` | `/invoices/:id/void` | Void an unpaid invoice | ADMIN+ |

### Payments & Allocations
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/payments` | List payments and invoice allocations | Authenticated |
| `POST` | `/payments` | Record payment with multi-invoice allocation | MEMBER+ |
| `GET` | `/payments/:id` | Get payment details | Authenticated |
| `POST` | `/payments/:id/refund` | Record full or partial payment refund | ADMIN+ |

### Discounts
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/discounts` | List discount rules | Authenticated |
| `POST` | `/discounts` | Create discount (percentage basis points or fixed) | ADMIN+ |
| `PATCH` | `/discounts/:id` | Update discount rule | ADMIN+ |
| `DELETE` | `/discounts/:id` | Delete discount rule | ADMIN+ |

### Dashboard & Analytics
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/summary` | Live MRR, ARR, active contracts, overdue balance | Authenticated |
| `GET` | `/analytics/revenue` | Billed vs Collected revenue trends | Authenticated |
| `GET` | `/analytics/subscriptions` | Breakdown by status and plan distribution | Authenticated |
| `GET` | `/analytics/customers` | Top customers by lifetime spend | Authenticated |
| `GET` | `/analytics/churn` | Historical monthly churn rate | Authenticated |

### Revenue Protection
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/revenue-protection/overview` | Summary of revenue at risk and open leaks | Authenticated |
| `GET` | `/revenue-protection/issues` | List detected issues (overdue, duplicates, math) | Authenticated |
| `GET` | `/revenue-protection/renewals` | Upcoming renewals flagged with churn risk | Authenticated |
| `POST` | `/revenue-protection/issues/:id/resolve` | Resolve or dismiss issue with notes | MEMBER+ |
| `POST` | `/revenue-protection/scan` | Run deterministic revenue leak audit scan | ADMIN+ |

### Notifications & Audit Logs
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | List user and organization notifications | Authenticated |
| `PATCH` | `/notifications/:id/read` | Mark notification as read | Authenticated |
| `POST` | `/notifications/read-all` | Mark all notifications as read | Authenticated |
| `GET` | `/audit-logs` | Query mutation audit trails | ADMIN+ |

### AI Business Assistant
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/assistant/chat` | Natural-language questions answered with verified data | Authenticated |

---

## 7. Frontend Integration Guide

The backend is engineered for direct integration with the React / Vite frontend.

### 1. HTTP-Only Cookie Authentication
Set `credentials: 'include'` on all `fetch` or `withCredentials: true` in `axios`:

```typescript
// Example: Logging in with Axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  withCredentials: true, // Crucial for HTTP-only cookies!
});

// 1. Log In
export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
}

// 2. Fetch Dashboard Summary
export async function fetchDashboardSummary() {
  const response = await api.get('/dashboard/summary');
  return response.data.data;
}

// 3. Fetch Revenue Protection Overview
export async function fetchRevenueProtection() {
  const response = await api.get('/revenue-protection/overview');
  return response.data.data;
}
```

### 2. Standard Response Structure

Successful responses always adhere to:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "message": "Optional user-friendly notification"
}
```

Error responses always adhere to:
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "details": [
      { "field": "password", "message": "Password must contain at least one uppercase letter" }
    ]
  }
}
```

---

## 8. Financial Calculation Specifications

1. **Monthly Recurring Revenue (MRR)**:
   $$\text{MRR} = \sum_{\text{active contracts}} \text{normalized monthly value}$$
   - Daily: $\text{price} \times \text{quantity} \times 30$
   - Weekly: $\text{Math.round}\left(\frac{\text{price} \times \text{quantity} \times 52}{12}\right)$
   - Monthly: $\frac{\text{price} \times \text{quantity}}{\text{intervalCount}}$
   - Quarterly: $\text{Math.round}\left(\frac{\text{price} \times \text{quantity}}{3}\right)$
   - Yearly: $\text{Math.round}\left(\frac{\text{price} \times \text{quantity}}{12}\right)$

2. **Annual Recurring Revenue (ARR)**:
   $$\text{ARR} = \text{MRR} \times 12$$
   *Assumption: Annualizes the current steady-state contracted recurring run-rate.*

3. **Churn Rate (%)**:
   $$\text{Churn Rate} = \frac{\text{Canceled Subscriptions in Period}}{\text{Active at Start} + \text{New Subscriptions in Period}} \times 100$$
