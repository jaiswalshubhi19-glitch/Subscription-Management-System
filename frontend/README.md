# SubscriptIQ — Intelligent Subscription Management & Revenue Protection Platform

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

SubscriptIQ is a high-performance commercial SaaS frontend engineered for subscription lifecycle operations, recurring billing management, and proactive revenue protection. Built with a refined light visual design system inspired by Stripe, Linear, and Vercel.

---

## 🌟 Key Functional Modules

### 1. Executive Dashboard
- **Financial KPIs**: Real-time tracking of Total Revenue, MRR, Active Subscriptions, Customer Accounts, Pending ACH Settlements, and Overdue Invoices.
- **Interactive Visualizations**: 12-month compounding gross vs net MRR velocity area charts and monthly subscription net-additions bar charts.
- **Transaction Radar**: Real-time feeds of payment processor attempts and upcoming contract renewals.

### 2. Customer Directory & Entitlements
- Full lifecycle account auditing with tier affiliations, contact profiles, and risk scores.
- Filter by status (*Active*, *Past Due*, *Trialing*, *Canceled*) with search across company, contact, or email.
- Account detail inspector and modal forms for provisioning and editing customer profiles.

### 3. Products & Subscription Plans Catalog
- Flexible catalog supporting multi-tier recurring models (Monthly, Annual prepaid) and add-on modules.
- Dynamic feature entitlement lists, trial period controls, and revenue contribution breakdown.

### 4. Subscription Management
- Granular lifecycle actions: **Pause Billing**, **Resume Billing**, **Cancel Subscription**, and **Plan Migrations**.
- Automated invoice generation and immediate synchronization with active MRR metrics.

### 5. Invoicing & Billing Statements
- Comprehensive receivables tracking with status badges (*Paid*, *Open*, *Overdue*, *Void*).
- **Commercial PDF Preview Modal** with line-item breakdowns, tax calculations, and printable receipts.
- 1-click payment reminder dispatches with customer notification simulation.

### 6. Payment Gateway Ledger
- Detailed transaction logs with payment instrument indicators (Cards, ACH Direct Debit, Wire Transfers).
- Diagnostic decline codes (*insufficient_funds*, *card_expired*, *do_not_honor*).
- **Retry Charge** action and **Full Refund** workflow.

### 7. Promotional Discounts & Coupons
- Manage percentage-based or fixed-dollar vouchers with expiration dates and maximum redemption limits.
- 1-click clipboard copy and redemption progress tracking.

### 8. Revenue Analytics & Unit Economics
- Financial metrics including **ARR**, **ARPU**, **Gross Churn Rate** (target < 2.5%), **Net Expansion MRR**, and **Estimated LTV**.
- Plan volume distribution pie charts and 5-month cohort retention heatmaps.

### 9. Revenue Protection Radar (Flagship Module)
- **At-Risk Capital Estimation**: Real-time calculation of revenue threatened by payment declines, expired instruments, or churn hazards.
- **Recovery Actions**:
  - *Smart ML-Based Gateway Retries*
  - *Automated Executive Dunning Sequences (Email & SMS)*
  - *Self-Serve Customer Card Refresh Portals*
  - *Idempotency Duplicate Safeguards*

### 10. AI Business Assistant
- Conversational intelligence copilot for financial data discovery, churn risk analysis, and dunning recommendations.
- Interactive prompt pills and structured Markdown reporting.

### 11. Workspace Settings & Developer Controls
- Legal organization profiles and commercial billing details.
- Dunning rules (retry intervals, max retry attempts, auto-cancellation grace periods).
- API Keys (Live & Test keys with 1-click rotation) and Webhook endpoint listener verification.
- Team member access control with role-based permissions (*Owner*, *Admin*, *Billing Ops*, *Viewer*).

---

## 🛠️ Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Charts**: Recharts
- **Font**: Inter

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ 
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/jaiswalshubhi19-glitch/Subscription-Management-System.git
cd Subscription-Management-System

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Building for Production
```bash
npm run build
```
Generates optimized assets in the `dist/` directory.

---

## ⌨️ Keyboard Shortcuts
- `⌘K` or `Ctrl+K`: Opens the universal search command palette to quickly jump to any page, customer, or invoice.
- `ESC`: Dismisses open modals and command palettes.

---

## 📄 License
This project is licensed under the MIT License.
