import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for SubscriptIQ (Brightloop Software)...');

  // Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.revenueProtectionIssue.deleteMany();
  await prisma.paymentAllocation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscriptionDiscount.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Create Organization: Brightloop Software
  const org = await prisma.organization.create({
    data: {
      name: 'Brightloop Software',
      slug: 'brightloop-software',
      currency: 'USD',
      timezone: 'America/New_York',
      taxRate: 1000, // 10.00%
      billingAddress: {
        street: '100 Innovation Way, Suite 400',
        city: 'New York',
        state: 'NY',
        country: 'US',
        postalCode: '10001',
      },
    },
  });

  console.log(`✅ Created Organization: ${org.name} (${org.id})`);

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Brightloop@2026', salt);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@brightloop.local',
      name: 'Brightloop Admin',
      passwordHash,
    },
  });

  const financeUser = await prisma.user.create({
    data: {
      email: 'sarah.finance@brightloop.local',
      name: 'Sarah Finance Lead',
      passwordHash,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      email: 'alex.sales@brightloop.local',
      name: 'Alex Sales Rep',
      passwordHash,
    },
  });

  // Assign memberships
  await prisma.organizationMember.createMany({
    data: [
      { organizationId: org.id, userId: adminUser.id, role: 'OWNER' },
      { organizationId: org.id, userId: financeUser.id, role: 'ADMIN' },
      { organizationId: org.id, userId: salesUser.id, role: 'MEMBER' },
    ],
  });

  console.log('✅ Created Users and Organization Memberships');

  // 3. Products
  const erpProduct = await prisma.product.create({
    data: {
      organizationId: org.id,
      name: 'Brightloop ERP Core',
      code: 'PROD-ERP-CORE',
      description: 'Unified business platform for subscription management, billing, and accounting',
      type: 'SOFTWARE',
      salesPrice: 9900, // $99.00
      costPrice: 2000,  // $20.00
      variants: [
        { brand: 'Standard Cloud', surcharge: 0 },
        { brand: 'Odoo Enterprise Connector', surcharge: 56000 }, // +$560.00 from PDF
      ],
    },
  });

  const analyticsProduct = await prisma.product.create({
    data: {
      organizationId: org.id,
      name: 'Revenue Protection & Analytics Add-on',
      code: 'PROD-REV-ANALYTICS',
      description: 'Intelligent leak detection, churn prevention, and executive forecasting',
      type: 'ADDON',
      salesPrice: 4900, // $49.00
      costPrice: 800,
    },
  });

  const supportProduct = await prisma.product.create({
    data: {
      organizationId: org.id,
      name: 'Dedicated 24/7 Enterprise SLA Support',
      code: 'PROD-SLA-SUPPORT',
      description: '15-minute response SLA with dedicated technical account manager',
      type: 'SERVICE',
      salesPrice: 29900, // $299.00
      costPrice: 10000,
    },
  });

  console.log('✅ Created Products');

  // 4. Plans
  const starterMonthlyPlan = await prisma.plan.create({
    data: {
      organizationId: org.id,
      productId: erpProduct.id,
      name: 'ERP Starter Monthly',
      code: 'PLAN-ERP-START-M',
      description: 'Full ERP access billed monthly for small growing businesses',
      billingInterval: 'MONTHLY',
      intervalCount: 1,
      price: 9900, // $99.00
      currency: 'USD',
      minQuantity: 1,
      trialPeriodDays: 14,
    },
  });

  const growthMonthlyPlan = await prisma.plan.create({
    data: {
      organizationId: org.id,
      productId: erpProduct.id,
      name: 'ERP Growth Monthly',
      code: 'PLAN-ERP-GROWTH-M',
      description: 'High-volume subscription ERP with multi-entity support',
      billingInterval: 'MONTHLY',
      intervalCount: 1,
      price: 24900, // $249.00
      currency: 'USD',
      minQuantity: 1,
      trialPeriodDays: 0,
    },
  });

  const enterpriseAnnualPlan = await prisma.plan.create({
    data: {
      organizationId: org.id,
      productId: erpProduct.id,
      name: 'ERP Enterprise Annual',
      code: 'PLAN-ERP-ENT-Y',
      description: 'Annual enterprise contract with dedicated support and SLA',
      billingInterval: 'YEARLY',
      intervalCount: 1,
      price: 249900, // $2,499.00
      currency: 'USD',
      minQuantity: 3,
    },
  });

  const analyticsMonthlyPlan = await prisma.plan.create({
    data: {
      organizationId: org.id,
      productId: analyticsProduct.id,
      name: 'Analytics Suite Monthly',
      code: 'PLAN-ANALYTICS-M',
      billingInterval: 'MONTHLY',
      intervalCount: 1,
      price: 4900, // $49.00
      currency: 'USD',
    },
  });

  console.log('✅ Created Plans');

  // 5. Discounts
  const launchDiscount = await prisma.discount.create({
    data: {
      organizationId: org.id,
      code: 'LAUNCH20',
      name: '20% Early Bird Discount',
      description: '20% off whole subscription for the first year',
      type: 'PERCENTAGE',
      value: 2000, // 20.00% in basis points
      appliesTo: 'WHOLE_SUBSCRIPTION',
      maxUses: 100,
      usedCount: 2,
    },
  });

  const enterpriseVoucher = await prisma.discount.create({
    data: {
      organizationId: org.id,
      code: 'ENTERPRISE500',
      name: '$500 Enterprise Credit',
      description: 'Flat $500 discount for annual accounts taking over 5 seats',
      type: 'FIXED_AMOUNT',
      value: 50000, // $500.00
      currency: 'USD',
      minQuantity: 5,
      appliesTo: 'WHOLE_SUBSCRIPTION',
    },
  });

  console.log('✅ Created Discounts');

  // 6. Customers
  const customer1 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      customerNumber: 'CUST-00001',
      name: 'Acme Global Industries',
      email: 'billing@acmeglobal.com',
      company: 'Acme Global Corp',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      country: 'USA',
      postalCode: '97477',
      taxId: 'US-987654321',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      customerNumber: 'CUST-00002',
      name: 'Starlight Digital Retail',
      email: 'finance@starlight.io',
      company: 'Starlight Retail LLC',
      phone: '+1 (555) 876-5432',
      address: '450 Silicon Blvd',
      city: 'San Jose',
      country: 'USA',
      postalCode: '95134',
      taxId: 'US-123456789',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      customerNumber: 'CUST-00003',
      name: 'Nova Health Diagnostics',
      email: 'accounts@novahealth.org',
      company: 'Nova Health Labs',
      phone: '+1 (555) 345-6789',
      address: '12 Medical Center Plaza',
      city: 'Boston',
      country: 'USA',
      postalCode: '02115',
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      organizationId: org.id,
      customerNumber: 'CUST-00004',
      name: 'Pinnacle Wealth Management',
      email: 'ops@pinnaclewealth.com',
      company: 'Pinnacle Financial Advisory',
      address: '200 Wall St, 15th Fl',
      city: 'New York',
      country: 'USA',
      postalCode: '10005',
    },
  });

  console.log('✅ Created Customers');

  // 7. Subscriptions
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAhead = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  // Sub 1: Acme Enterprise Annual
  const sub1 = await prisma.subscription.create({
    data: {
      organizationId: org.id,
      subscriptionNumber: 'SUB-00001',
      customerId: customer1.id,
      planId: enterpriseAnnualPlan.id,
      status: 'ACTIVE',
      quantity: 5,
      unitPrice: enterpriseAnnualPlan.price,
      currency: 'USD',
      currentPeriodStart: thirtyDaysAgo,
      currentPeriodEnd: new Date(thirtyDaysAgo.getTime() + 365 * 24 * 60 * 60 * 1000),
      renewalDate: new Date(thirtyDaysAgo.getTime() + 365 * 24 * 60 * 60 * 1000),
      paymentTerms: 'Net 30',
    },
  });

  // Attach discount to Sub 1
  await prisma.subscriptionDiscount.create({
    data: {
      subscriptionId: sub1.id,
      discountId: enterpriseVoucher.id,
    },
  });

  // Sub 2: Starlight Growth Monthly (Active, renewing in 3 days)
  const sub2 = await prisma.subscription.create({
    data: {
      organizationId: org.id,
      subscriptionNumber: 'SUB-00002',
      customerId: customer2.id,
      planId: growthMonthlyPlan.id,
      status: 'ACTIVE',
      quantity: 2,
      unitPrice: growthMonthlyPlan.price,
      currency: 'USD',
      currentPeriodStart: new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      renewalDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      paymentTerms: 'Due on receipt',
    },
  });

  // Sub 3: Nova Health (PAST_DUE due to unpaid overdue invoice)
  const sub3 = await prisma.subscription.create({
    data: {
      organizationId: org.id,
      subscriptionNumber: 'SUB-00003',
      customerId: customer3.id,
      planId: starterMonthlyPlan.id,
      status: 'PAST_DUE',
      quantity: 3,
      unitPrice: starterMonthlyPlan.price,
      currency: 'USD',
      currentPeriodStart: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      renewalDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    },
  });

  // Sub 4: Pinnacle Wealth (PAUSED)
  await prisma.subscription.create({
    data: {
      organizationId: org.id,
      subscriptionNumber: 'SUB-00004',
      customerId: customer4.id,
      planId: starterMonthlyPlan.id,
      status: 'PAUSED',
      quantity: 1,
      unitPrice: starterMonthlyPlan.price,
      currency: 'USD',
      currentPeriodStart: thirtyDaysAgo,
      currentPeriodEnd: thirtyDaysAhead,
      pausedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created Subscriptions');

  // 8. Invoices and Payments
  // Invoice 1: Acme Enterprise (PAID)
  const acmeGross = 5 * enterpriseAnnualPlan.price; // 12,495.00
  const acmeDisc = 50000; // $500.00
  const acmeTax = Math.round(((acmeGross - acmeDisc) * 1000) / 10000); // 10%
  const acmeTotal = acmeGross - acmeDisc + acmeTax;

  const inv1 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      invoiceNumber: 'INV-2026-00001',
      subscriptionId: sub1.id,
      customerId: customer1.id,
      status: 'PAID',
      billingReason: 'SUBSCRIPTION_CYCLE',
      currency: 'USD',
      subtotal: acmeGross,
      discountTotal: acmeDisc,
      taxRate: 1000,
      taxTotal: acmeTax,
      total: acmeTotal,
      amountPaid: acmeTotal,
      amountDue: 0,
      dueDate: thirtyDaysAgo,
      paidAt: thirtyDaysAgo,
      customerSnapshot: {
        name: customer1.name,
        email: customer1.email,
        company: customer1.company,
        address: customer1.address,
      },
      items: {
        create: [
          {
            productId: erpProduct.id,
            description: `${enterpriseAnnualPlan.name} x 5 seats`,
            quantity: 5,
            unitPrice: enterpriseAnnualPlan.price,
            discountAmount: acmeDisc,
            taxAmount: acmeTax,
            totalAmount: acmeTotal,
          },
        ],
      },
    },
  });

  const pay1 = await prisma.payment.create({
    data: {
      organizationId: org.id,
      customerId: customer1.id,
      paymentNumber: 'PAY-2026-00001',
      amount: acmeTotal,
      currency: 'USD',
      status: 'SUCCEEDED',
      method: 'BANK_TRANSFER',
      reference: 'WIRE-ACM-2026-891',
      paidAt: thirtyDaysAgo,
      allocations: {
        create: {
          invoiceId: inv1.id,
          amount: acmeTotal,
        },
      },
    },
  });

  // Invoice 2: Starlight Growth Monthly (OPEN, due in 3 days)
  const starGross = 2 * growthMonthlyPlan.price; // $498.00
  const starTax = Math.round((starGross * 1000) / 10000);
  const starTotal = starGross + starTax;

  await prisma.invoice.create({
    data: {
      organizationId: org.id,
      invoiceNumber: 'INV-2026-00002',
      subscriptionId: sub2.id,
      customerId: customer2.id,
      status: 'OPEN',
      billingReason: 'SUBSCRIPTION_CYCLE',
      currency: 'USD',
      subtotal: starGross,
      discountTotal: 0,
      taxRate: 1000,
      taxTotal: starTax,
      total: starTotal,
      amountPaid: 0,
      amountDue: starTotal,
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      customerSnapshot: {
        name: customer2.name,
        email: customer2.email,
        company: customer2.company,
      },
      items: {
        create: [
          {
            productId: erpProduct.id,
            description: `${growthMonthlyPlan.name} x 2 seats`,
            quantity: 2,
            unitPrice: growthMonthlyPlan.price,
            discountAmount: 0,
            taxAmount: starTax,
            totalAmount: starTotal,
          },
        ],
      },
    },
  });

  // Invoice 3: Nova Health (OVERDUE by 15 days -> Triggers Revenue Protection!)
  const novaGross = 3 * starterMonthlyPlan.price; // $297.00
  const novaTax = Math.round((novaGross * 1000) / 10000);
  const novaTotal = novaGross + novaTax;

  const inv3 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      invoiceNumber: 'INV-2026-00003',
      subscriptionId: sub3.id,
      customerId: customer3.id,
      status: 'OVERDUE',
      billingReason: 'SUBSCRIPTION_CYCLE',
      currency: 'USD',
      subtotal: novaGross,
      discountTotal: 0,
      taxRate: 1000,
      taxTotal: novaTax,
      total: novaTotal,
      amountPaid: 0,
      amountDue: novaTotal,
      dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      customerSnapshot: {
        name: customer3.name,
        email: customer3.email,
        company: customer3.company,
      },
      items: {
        create: [
          {
            productId: erpProduct.id,
            description: `${starterMonthlyPlan.name} x 3 licenses`,
            quantity: 3,
            unitPrice: starterMonthlyPlan.price,
            discountAmount: 0,
            taxAmount: novaTax,
            totalAmount: novaTotal,
          },
        ],
      },
    },
  });

  console.log('✅ Created Invoices, Line Items, and Payments');

  // 9. Revenue Protection Issues
  await prisma.revenueProtectionIssue.create({
    data: {
      organizationId: org.id,
      issueType: 'OVERDUE_INVOICE',
      severity: 'HIGH',
      customerId: customer3.id,
      subscriptionId: sub3.id,
      invoiceId: inv3.id,
      title: `Unpaid Overdue Invoice ${inv3.invoiceNumber}`,
      description: `Invoice ${inv3.invoiceNumber} for Nova Health Diagnostics is 15 days past due with an outstanding balance of $${(inv3.amountDue / 100).toFixed(2)}.`,
      suggestedAction: 'Send automated dunning payment reminder or contact customer billing contact.',
      status: 'OPEN',
    },
  });

  await prisma.revenueProtectionIssue.create({
    data: {
      organizationId: org.id,
      issueType: 'UPCOMING_RENEWAL_AT_RISK',
      severity: 'MEDIUM',
      customerId: customer2.id,
      subscriptionId: sub2.id,
      title: 'Upcoming Renewal Pending Confirmation',
      description: 'Starlight Digital Retail renews in 3 days. Verify billing contact and automated payment method on file.',
      suggestedAction: 'Send automated renewal notice email before billing date.',
      status: 'OPEN',
    },
  });

  console.log('✅ Created Revenue Protection Issues');

  // 10. Notifications and Audit Logs
  await prisma.notification.createMany({
    data: [
      {
        organizationId: org.id,
        type: 'BILLING',
        title: 'Payment Received from Acme Global',
        message: 'Wire payment of $13,194.50 received and allocated to INV-2026-00001.',
      },
      {
        organizationId: org.id,
        type: 'REVENUE_PROTECTION',
        title: 'Revenue Protection Alert: Overdue Invoice',
        message: 'Invoice INV-2026-00003 for Nova Health Diagnostics is 15 days past due.',
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: org.id,
        userId: adminUser.id,
        action: 'ORG_INITIALIZED',
        entity: 'Organization',
        entityId: org.id,
        newValues: { name: org.name, slug: org.slug },
      },
      {
        organizationId: org.id,
        userId: financeUser.id,
        action: 'INVOICE_GENERATED',
        entity: 'Invoice',
        entityId: inv1.id,
        newValues: { invoiceNumber: inv1.invoiceNumber, total: inv1.total },
      },
    ],
  });

  console.log('✅ Created Notifications and Audit Logs');
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('Credentials to log in:');
  console.log('  Admin:   admin@brightloop.local       / Brightloop@2026 (Role: OWNER)');
  console.log('  Finance: sarah.finance@brightloop.local / Brightloop@2026 (Role: ADMIN)');
  console.log('  Sales:   alex.sales@brightloop.local    / Brightloop@2026 (Role: MEMBER)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
