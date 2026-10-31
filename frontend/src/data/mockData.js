// Realistic enterprise sample data for SubscriptIQ

export const initialCustomers = [
  {
    id: "cus_01HM8A1",
    name: "Acme Corporation",
    contactName: "Sarah Jenkins",
    email: "sarah.j@acmeworks.io",
    company: "Acme Corp",
    plan: "Enterprise Plus",
    planId: "plan_enterprise",
    status: "active",
    mrr: 1250,
    billingCycle: "monthly",
    paymentMethod: { type: "card", brand: "Visa", last4: "4242", expiry: "08/28" },
    country: "US",
    joinedDate: "2025-03-15",
    riskScore: "low",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "cus_02HM8B2",
    name: "Linear Systems Inc",
    contactName: "Marcus Sterling",
    email: "marcus@linearsys.com",
    company: "Linear Systems",
    plan: "Growth Pro",
    planId: "plan_growth",
    status: "active",
    mrr: 450,
    billingCycle: "monthly",
    paymentMethod: { type: "card", brand: "Mastercard", last4: "8821", expiry: "11/27" },
    country: "US",
    joinedDate: "2025-05-20",
    riskScore: "low",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "cus_03HM8C3",
    name: "CloudScale Technologies",
    contactName: "Elena Rostova",
    email: "elena.r@cloudscale.net",
    company: "CloudScale Tech",
    plan: "Enterprise Plus",
    planId: "plan_enterprise",
    status: "past_due",
    mrr: 1500,
    billingCycle: "annual",
    paymentMethod: { type: "card", brand: "Visa", last4: "1092", expiry: "10/26" },
    country: "DE",
    joinedDate: "2024-11-10",
    riskScore: "high",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "cus_04HM8D4",
    name: "Apex FinTech Global",
    contactName: "David Kim",
    email: "d.kim@apexfintech.io",
    company: "Apex FinTech",
    plan: "Growth Pro",
    planId: "plan_growth",
    status: "active",
    mrr: 450,
    billingCycle: "monthly",
    paymentMethod: { type: "bank_transfer", brand: "ACH", last4: "9482", expiry: "N/A" },
    country: "US",
    joinedDate: "2025-01-12",
    riskScore: "low",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "cus_05HM8E5",
    name: "Hyperion Media Lab",
    contactName: "Chloe Dupont",
    email: "chloe@hyperion.fr",
    company: "Hyperion Media",
    plan: "Starter Standard",
    planId: "plan_starter",
    status: "active",
    mrr: 120,
    billingCycle: "monthly",
    paymentMethod: { type: "card", brand: "Amex", last4: "3004", expiry: "04/27" },
    country: "FR",
    joinedDate: "2025-06-01",
    riskScore: "medium",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "cus_06HM8F6",
    name: "SaaSify Studio UK",
    contactName: "Oliver Davies",
    email: "oliver@saasify.co.uk",
    company: "SaaSify Ltd",
    plan: "Growth Pro",
    planId: "plan_growth",
    status: "trialing",
    mrr: 450,
    billingCycle: "monthly",
    paymentMethod: { type: "card", brand: "Visa", last4: "7729", expiry: "09/27" },
    country: "GB",
    joinedDate: "2026-10-18",
    riskScore: "low",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "cus_07HM8G7",
    name: "Nexus Dynamics GmbH",
    contactName: "Stefan Meyer",
    email: "stefan@nexus-dyn.de",
    company: "Nexus Dynamics",
    plan: "Enterprise Plus",
    planId: "plan_enterprise",
    status: "past_due",
    mrr: 2100,
    billingCycle: "monthly",
    paymentMethod: { type: "card", brand: "Mastercard", last4: "5512", expiry: "09/26" },
    country: "DE",
    joinedDate: "2025-02-14",
    riskScore: "high",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "cus_08HM8H8",
    name: "OmniChannel Insights",
    contactName: "Amina Al-Mansoor",
    email: "amina@omnichannel.ae",
    company: "OmniChannel LLC",
    plan: "Growth Pro",
    planId: "plan_growth",
    status: "active",
    mrr: 450,
    billingCycle: "annual",
    paymentMethod: { type: "card", brand: "Visa", last4: "9910", expiry: "12/28" },
    country: "AE",
    joinedDate: "2025-04-05",
    riskScore: "low",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "cus_09HM8I9",
    name: "Beacon AI Robotics",
    contactName: "Julian Vance",
    email: "jvance@beaconrobotics.com",
    company: "Beacon AI",
    plan: "Enterprise Plus",
    planId: "plan_enterprise",
    status: "canceled",
    mrr: 0,
    billingCycle: "monthly",
    paymentMethod: { type: "card", brand: "Visa", last4: "4001", expiry: "01/27" },
    country: "US",
    joinedDate: "2024-09-01",
    riskScore: "high",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "cus_10HM8J0",
    name: "QuantLab Analytics",
    contactName: "Rachel Torres",
    email: "rachel.t@quantlab.co",
    company: "QuantLab",
    plan: "Starter Standard",
    planId: "plan_starter",
    status: "active",
    mrr: 120,
    billingCycle: "monthly",
    paymentMethod: { type: "card", brand: "Mastercard", last4: "6633", expiry: "07/27" },
    country: "US",
    joinedDate: "2025-07-29",
    riskScore: "low",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face"
  }
];

export const initialProducts = [
  {
    id: "prod_01",
    name: "SubscriptIQ Core Platform",
    code: "SIQ-CORE",
    description: "Full-featured subscription lifecycle management engine, automated billing and customer portal.",
    category: "Subscription Engine",
    status: "active",
    plansCount: 3,
    activeSubscribers: 284,
    monthlyRevenue: 34200,
    createdAt: "2024-01-15"
  },
  {
    id: "prod_02",
    name: "Revenue Shield Dunning & Protection",
    code: "SIQ-SHIELD",
    description: "Automated failed payment recovery, smart retry heuristics, pre-expiry card alerts and dunning flows.",
    category: "Revenue Protection",
    status: "active",
    plansCount: 2,
    activeSubscribers: 198,
    monthlyRevenue: 9800,
    createdAt: "2024-06-20"
  },
  {
    id: "prod_03",
    name: "Metered Usage Billing Engine",
    code: "SIQ-METER",
    description: "High-throughput event-based usage tracking, tier calculation and dynamic mid-cycle invoicing.",
    category: "Add-on Module",
    status: "active",
    plansCount: 2,
    activeSubscribers: 86,
    monthlyRevenue: 4250,
    createdAt: "2025-02-10"
  }
];

export const initialPlans = [
  {
    id: "plan_starter",
    productId: "prod_01",
    productName: "SubscriptIQ Core Platform",
    name: "Starter Standard",
    code: "PLAN-STR-01",
    price: 120,
    billingInterval: "monthly",
    trialDays: 14,
    currency: "USD",
    status: "active",
    activeSubscribers: 84,
    features: [
      "Up to 250 active subscriptions",
      "Stripe & Adyen payment gateway sync",
      "Standard customer portal",
      "Email invoice delivery",
      "Community support"
    ]
  },
  {
    id: "plan_growth",
    productId: "prod_01",
    productName: "SubscriptIQ Core Platform",
    name: "Growth Pro",
    code: "PLAN-GRO-02",
    price: 450,
    billingInterval: "monthly",
    trialDays: 14,
    currency: "USD",
    status: "active",
    activeSubscribers: 172,
    features: [
      "Up to 2,500 active subscriptions",
      "Automated dunning cadence (3 attempts)",
      "Multi-currency support (EUR, GBP, JPY)",
      "Webhook and REST API access",
      "Priority 24/7 support & SLA"
    ]
  },
  {
    id: "plan_enterprise",
    productId: "prod_01",
    productName: "SubscriptIQ Core Platform",
    name: "Enterprise Plus",
    code: "PLAN-ENT-03",
    price: 1250,
    billingInterval: "monthly",
    trialDays: 30,
    currency: "USD",
    status: "active",
    activeSubscribers: 86,
    features: [
      "Unlimited subscriptions & invoices",
      "AI Revenue Protection & proactive dunning",
      "Custom payment routing & fallbacks",
      "Dedicated Technical Account Manager",
      "SOC2 Type II compliance export"
    ]
  },
  {
    id: "plan_shield_pro",
    productId: "prod_02",
    productName: "Revenue Shield Dunning & Protection",
    name: "Revenue Shield Standalone",
    code: "PLAN-SHIELD-01",
    price: 290,
    billingInterval: "monthly",
    trialDays: 7,
    currency: "USD",
    status: "active",
    activeSubscribers: 45,
    features: [
      "Smart machine-learning retry schedules",
      "Automated email & SMS card update flows",
      "Real-time revenue at risk radar",
      "Preventative card expiration detection"
    ]
  }
];

export const initialSubscriptions = [
  {
    id: "sub_101",
    customerId: "cus_01HM8A1",
    customerName: "Acme Corporation",
    customerEmail: "sarah.j@acmeworks.io",
    planId: "plan_enterprise",
    planName: "Enterprise Plus",
    amount: 1250,
    currency: "USD",
    billingInterval: "monthly",
    status: "active",
    startDate: "2025-03-15",
    currentPeriodStart: "2026-10-15",
    currentPeriodEnd: "2026-11-15",
    cancelAtPeriodEnd: false
  },
  {
    id: "sub_102",
    customerId: "cus_02HM8B2",
    customerName: "Linear Systems Inc",
    customerEmail: "marcus@linearsys.com",
    planId: "plan_growth",
    planName: "Growth Pro",
    amount: 450,
    currency: "USD",
    billingInterval: "monthly",
    status: "active",
    startDate: "2025-05-20",
    currentPeriodStart: "2026-10-20",
    currentPeriodEnd: "2026-11-20",
    cancelAtPeriodEnd: false
  },
  {
    id: "sub_103",
    customerId: "cus_03HM8C3",
    customerName: "CloudScale Technologies",
    customerEmail: "elena.r@cloudscale.net",
    planId: "plan_enterprise",
    planName: "Enterprise Plus",
    amount: 1500,
    currency: "USD",
    billingInterval: "monthly",
    status: "past_due",
    startDate: "2024-11-10",
    currentPeriodStart: "2026-10-10",
    currentPeriodEnd: "2026-11-10",
    cancelAtPeriodEnd: false
  },
  {
    id: "sub_104",
    customerId: "cus_04HM8D4",
    customerName: "Apex FinTech Global",
    customerEmail: "d.kim@apexfintech.io",
    planId: "plan_growth",
    planName: "Growth Pro",
    amount: 450,
    currency: "USD",
    billingInterval: "monthly",
    status: "active",
    startDate: "2025-01-12",
    currentPeriodStart: "2026-10-12",
    currentPeriodEnd: "2026-11-12",
    cancelAtPeriodEnd: false
  },
  {
    id: "sub_105",
    customerId: "cus_05HM8E5",
    customerName: "Hyperion Media Lab",
    customerEmail: "chloe@hyperion.fr",
    planId: "plan_starter",
    planName: "Starter Standard",
    amount: 120,
    currency: "USD",
    billingInterval: "monthly",
    status: "active",
    startDate: "2025-06-01",
    currentPeriodStart: "2026-10-01",
    currentPeriodEnd: "2026-11-01",
    cancelAtPeriodEnd: false
  },
  {
    id: "sub_106",
    customerId: "cus_06HM8F6",
    customerName: "SaaSify Studio UK",
    customerEmail: "oliver@saasify.co.uk",
    planId: "plan_growth",
    planName: "Growth Pro",
    amount: 450,
    currency: "USD",
    billingInterval: "monthly",
    status: "trialing",
    startDate: "2026-10-18",
    currentPeriodStart: "2026-10-18",
    currentPeriodEnd: "2026-11-01",
    cancelAtPeriodEnd: false
  },
  {
    id: "sub_107",
    customerId: "cus_07HM8G7",
    customerName: "Nexus Dynamics GmbH",
    customerEmail: "stefan@nexus-dyn.de",
    planId: "plan_enterprise",
    planName: "Enterprise Plus",
    amount: 2100,
    currency: "USD",
    billingInterval: "monthly",
    status: "past_due",
    startDate: "2025-02-14",
    currentPeriodStart: "2026-10-14",
    currentPeriodEnd: "2026-11-14",
    cancelAtPeriodEnd: false
  },
  {
    id: "sub_108",
    customerId: "cus_08HM8H8",
    customerName: "OmniChannel Insights",
    customerEmail: "amina@omnichannel.ae",
    planId: "plan_growth",
    planName: "Growth Pro",
    amount: 450,
    currency: "USD",
    billingInterval: "annual",
    status: "active",
    startDate: "2025-04-05",
    currentPeriodStart: "2026-04-05",
    currentPeriodEnd: "2027-04-05",
    cancelAtPeriodEnd: false
  },
  {
    id: "sub_109",
    customerId: "cus_09HM8I9",
    customerName: "Beacon AI Robotics",
    customerEmail: "jvance@beaconrobotics.com",
    planId: "plan_enterprise",
    planName: "Enterprise Plus",
    amount: 1250,
    currency: "USD",
    billingInterval: "monthly",
    status: "canceled",
    startDate: "2024-09-01",
    currentPeriodStart: "2026-08-01",
    currentPeriodEnd: "2026-09-01",
    cancelAtPeriodEnd: true
  }
];

export const initialInvoices = [
  {
    id: "inv_9011",
    invoiceNumber: "INV-2026-0911",
    customerId: "cus_01HM8A1",
    customerName: "Acme Corporation",
    customerEmail: "sarah.j@acmeworks.io",
    amount: 1250.00,
    currency: "USD",
    status: "paid",
    issueDate: "2026-10-15",
    dueDate: "2026-10-25",
    paidDate: "2026-10-15",
    lineItems: [
      { description: "SubscriptIQ Enterprise Plus (Monthly)", qty: 1, unitPrice: 1250.00, total: 1250.00 }
    ]
  },
  {
    id: "inv_9012",
    invoiceNumber: "INV-2026-0912",
    customerId: "cus_03HM8C3",
    customerName: "CloudScale Technologies",
    customerEmail: "elena.r@cloudscale.net",
    amount: 1500.00,
    currency: "USD",
    status: "overdue",
    issueDate: "2026-10-10",
    dueDate: "2026-10-20",
    paidDate: null,
    daysOverdue: 10,
    lineItems: [
      { description: "SubscriptIQ Enterprise Plus (Monthly)", qty: 1, unitPrice: 1500.00, total: 1500.00 }
    ]
  },
  {
    id: "inv_9013",
    invoiceNumber: "INV-2026-0913",
    customerId: "cus_07HM8G7",
    customerName: "Nexus Dynamics GmbH",
    customerEmail: "stefan@nexus-dyn.de",
    amount: 2100.00,
    currency: "USD",
    status: "overdue",
    issueDate: "2026-10-14",
    dueDate: "2026-10-24",
    paidDate: null,
    daysOverdue: 6,
    lineItems: [
      { description: "SubscriptIQ Enterprise Plus + Addons", qty: 1, unitPrice: 2100.00, total: 2100.00 }
    ]
  },
  {
    id: "inv_9014",
    invoiceNumber: "INV-2026-0914",
    customerId: "cus_02HM8B2",
    customerName: "Linear Systems Inc",
    customerEmail: "marcus@linearsys.com",
    amount: 450.00,
    currency: "USD",
    status: "paid",
    issueDate: "2026-10-20",
    dueDate: "2026-10-30",
    paidDate: "2026-10-20",
    lineItems: [
      { description: "Growth Pro Subscription", qty: 1, unitPrice: 450.00, total: 450.00 }
    ]
  },
  {
    id: "inv_9015",
    invoiceNumber: "INV-2026-0915",
    customerId: "cus_04HM8D4",
    customerName: "Apex FinTech Global",
    customerEmail: "d.kim@apexfintech.io",
    amount: 450.00,
    currency: "USD",
    status: "open",
    issueDate: "2026-10-28",
    dueDate: "2026-11-07",
    paidDate: null,
    lineItems: [
      { description: "Growth Pro Plan (Monthly)", qty: 1, unitPrice: 450.00, total: 450.00 }
    ]
  },
  {
    id: "inv_9016",
    invoiceNumber: "INV-2026-0916",
    customerId: "cus_05HM8E5",
    customerName: "Hyperion Media Lab",
    customerEmail: "chloe@hyperion.fr",
    amount: 120.00,
    currency: "USD",
    status: "paid",
    issueDate: "2026-10-01",
    dueDate: "2026-10-11",
    paidDate: "2026-10-01",
    lineItems: [
      { description: "Starter Standard", qty: 1, unitPrice: 120.00, total: 120.00 }
    ]
  },
  {
    id: "inv_9017",
    invoiceNumber: "INV-2026-0917",
    customerId: "cus_10HM8J0",
    customerName: "QuantLab Analytics",
    customerEmail: "rachel.t@quantlab.co",
    amount: 120.00,
    currency: "USD",
    status: "open",
    issueDate: "2026-10-29",
    dueDate: "2026-11-08",
    paidDate: null,
    lineItems: [
      { description: "Starter Standard", qty: 1, unitPrice: 120.00, total: 120.00 }
    ]
  },
  {
    id: "inv_9018",
    invoiceNumber: "INV-2026-0918",
    customerId: "cus_09HM8I9",
    customerName: "Beacon AI Robotics",
    customerEmail: "jvance@beaconrobotics.com",
    amount: 1250.00,
    currency: "USD",
    status: "void",
    issueDate: "2026-09-01",
    dueDate: "2026-09-11",
    paidDate: null,
    lineItems: [
      { description: "Enterprise Tier (Canceled on request)", qty: 1, unitPrice: 1250.00, total: 1250.00 }
    ]
  }
];

export const initialPayments = [
  {
    id: "pay_301",
    transactionId: "txn_8829103A",
    customerName: "Acme Corporation",
    customerEmail: "sarah.j@acmeworks.io",
    invoiceNumber: "INV-2026-0911",
    amount: 1250.00,
    currency: "USD",
    status: "succeeded",
    method: "Visa •••• 4242",
    date: "2026-10-15 14:22:09",
    fee: 36.55,
    net: 1213.45
  },
  {
    id: "pay_302",
    transactionId: "txn_8829104B",
    customerName: "Linear Systems Inc",
    customerEmail: "marcus@linearsys.com",
    invoiceNumber: "INV-2026-0914",
    amount: 450.00,
    currency: "USD",
    status: "succeeded",
    method: "Mastercard •••• 8821",
    date: "2026-10-20 09:12:44",
    fee: 13.35,
    net: 436.65
  },
  {
    id: "pay_303",
    transactionId: "txn_8829105C",
    customerName: "CloudScale Technologies",
    customerEmail: "elena.r@cloudscale.net",
    invoiceNumber: "INV-2026-0912",
    amount: 1500.00,
    currency: "USD",
    status: "failed",
    failureReason: "card_declined: insufficient_funds",
    method: "Visa •••• 1092",
    date: "2026-10-20 04:30:12",
    fee: 0,
    net: 0
  },
  {
    id: "pay_304",
    transactionId: "txn_8829106D",
    customerName: "Nexus Dynamics GmbH",
    customerEmail: "stefan@nexus-dyn.de",
    invoiceNumber: "INV-2026-0913",
    amount: 2100.00,
    currency: "USD",
    status: "failed",
    failureReason: "expired_card: card_expired",
    method: "Mastercard •••• 5512",
    date: "2026-10-24 11:05:00",
    fee: 0,
    net: 0
  },
  {
    id: "pay_305",
    transactionId: "txn_8829107E",
    customerName: "Hyperion Media Lab",
    customerEmail: "chloe@hyperion.fr",
    invoiceNumber: "INV-2026-0916",
    amount: 120.00,
    currency: "USD",
    status: "succeeded",
    method: "Amex •••• 3004",
    date: "2026-10-01 10:14:20",
    fee: 4.10,
    net: 115.90
  },
  {
    id: "pay_306",
    transactionId: "txn_8829108F",
    customerName: "Apex FinTech Global",
    customerEmail: "d.kim@apexfintech.io",
    invoiceNumber: "INV-2026-0915",
    amount: 450.00,
    currency: "USD",
    status: "pending",
    failureReason: "ACH settlement pending verification",
    method: "ACH Direct Debit •••• 9482",
    date: "2026-10-28 17:45:00",
    fee: 1.50,
    net: 448.50
  },
  {
    id: "pay_307",
    transactionId: "txn_8829109G",
    customerName: "Beacon AI Robotics",
    customerEmail: "jvance@beaconrobotics.com",
    invoiceNumber: "INV-2026-0801",
    amount: 1250.00,
    currency: "USD",
    status: "refunded",
    failureReason: "Customer requested cancellation within grace period",
    method: "Visa •••• 4001",
    date: "2026-08-15 16:30:19",
    fee: 0,
    net: -1250.00
  }
];

export const initialDiscounts = [
  {
    id: "disc_01",
    code: "STARTUP50",
    description: "50% off for verified early stage startups for 6 months",
    discountType: "percentage",
    value: 50,
    duration: "repeating",
    durationInMonths: 6,
    timesRedeemed: 34,
    maxRedemptions: 100,
    status: "active",
    validUntil: "2026-12-31"
  },
  {
    id: "disc_02",
    code: "ENTERPRISE2026",
    description: "$200 flat discount on Enterprise Annual commitments",
    discountType: "fixed_amount",
    value: 200,
    duration: "once",
    durationInMonths: null,
    timesRedeemed: 18,
    maxRedemptions: 50,
    status: "active",
    validUntil: "2026-11-30"
  },
  {
    id: "disc_03",
    code: "ANNUAL15",
    description: "15% off forever on annual billed contracts",
    discountType: "percentage",
    value: 15,
    duration: "forever",
    durationInMonths: null,
    timesRedeemed: 79,
    maxRedemptions: null,
    status: "active",
    validUntil: null
  },
  {
    id: "disc_04",
    code: "EARLYBIRD_BETA",
    description: "Legacy beta tester lifetime 25% discount",
    discountType: "percentage",
    value: 25,
    duration: "forever",
    durationInMonths: null,
    timesRedeemed: 50,
    maxRedemptions: 50,
    status: "expired",
    validUntil: "2025-01-01"
  }
];

export const initialRevenueProtectionAlerts = [
  {
    id: "alert_01",
    type: "overdue_invoice",
    severity: "critical",
    title: "Overdue Invoice #INV-2026-0913 ($2,100)",
    customerName: "Nexus Dynamics GmbH",
    customerEmail: "stefan@nexus-dyn.de",
    amountAtRisk: 2100.00,
    daysOverdue: 6,
    reason: "Payment failed due to expired credit card (Mastercard •••• 5512). Customer has not responded to first automated email.",
    recommendedAction: "Send Executive Dunning Notice & SMS payment update link.",
    recoveryStatus: "action_needed",
    detectedAt: "2026-10-24 11:05"
  },
  {
    id: "alert_02",
    type: "failed_payment",
    severity: "high",
    title: "Payment Failure for CloudScale Technologies ($1,500)",
    customerName: "CloudScale Technologies",
    customerEmail: "elena.r@cloudscale.net",
    amountAtRisk: 1500.00,
    daysOverdue: 10,
    reason: "Transaction declined with code 'insufficient_funds'. 2nd automatic retry scheduled for tomorrow morning.",
    recommendedAction: "Trigger Smart Retry algorithm with dynamic time window or request backup card.",
    recoveryStatus: "retry_scheduled",
    detectedAt: "2026-10-20 04:30"
  },
  {
    id: "alert_03",
    type: "card_expiring",
    severity: "medium",
    title: "Upcoming Card Expiration - Hyperion Media Lab ($120 MRR)",
    customerName: "Hyperion Media Lab",
    customerEmail: "chloe@hyperion.fr",
    amountAtRisk: 120.00,
    daysOverdue: 0,
    reason: "Active billing card Amex •••• 3004 expires next month. Subscription auto-renewal set for Nov 1.",
    recommendedAction: "Deploy pre-dunning card refresh banner inside customer portal.",
    recoveryStatus: "pre_dunning_sent",
    detectedAt: "2026-10-28 09:00"
  },
  {
    id: "alert_04",
    type: "duplicate_billing_risk",
    severity: "medium",
    title: "Potential Duplicate Charge Prevented - Linear Systems",
    customerName: "Linear Systems Inc",
    customerEmail: "marcus@linearsys.com",
    amountAtRisk: 450.00,
    daysOverdue: 0,
    reason: "Two identical webhook billing events received within 14 seconds from external sync gateway.",
    recommendedAction: "Idempotency filter activated. Verification requested to unfreeze duplicate queue.",
    recoveryStatus: "quarantined",
    detectedAt: "2026-10-29 18:22"
  },
  {
    id: "alert_05",
    type: "high_churn_risk",
    severity: "high",
    title: "Elevated Churn Risk: Zero Login Activity in 28 Days",
    customerName: "Apex FinTech Global",
    customerEmail: "d.kim@apexfintech.io",
    amountAtRisk: 450.00,
    daysOverdue: 0,
    reason: "Workspace activity dropped by 88% over past month. Annual contract renewal coming up in 45 days.",
    recommendedAction: "Notify Customer Success Lead for proactive executive check-in.",
    recoveryStatus: "action_needed",
    detectedAt: "2026-10-27 15:40"
  }
];

export const revenueTrends = [
  { month: "Nov 25", revenue: 38200, mrr: 35100, newSubscriptions: 24, churned: 3 },
  { month: "Dec 25", revenue: 39900, mrr: 36800, newSubscriptions: 28, churned: 4 },
  { month: "Jan 26", revenue: 41500, mrr: 38200, newSubscriptions: 31, churned: 2 },
  { month: "Feb 26", revenue: 42800, mrr: 39900, newSubscriptions: 26, churned: 5 },
  { month: "Mar 26", revenue: 44200, mrr: 41200, newSubscriptions: 35, churned: 3 },
  { month: "Apr 26", revenue: 45600, mrr: 42800, newSubscriptions: 29, churned: 4 },
  { month: "May 26", revenue: 47100, mrr: 44100, newSubscriptions: 33, churned: 2 },
  { month: "Jun 26", revenue: 48900, mrr: 45500, newSubscriptions: 38, churned: 3 },
  { month: "Jul 26", revenue: 50200, mrr: 46800, newSubscriptions: 30, churned: 6 },
  { month: "Aug 26", revenue: 51800, mrr: 47900, newSubscriptions: 34, churned: 4 },
  { month: "Sep 26", revenue: 53100, mrr: 49200, newSubscriptions: 37, churned: 3 },
  { month: "Oct 26", revenue: 55400, mrr: 51250, newSubscriptions: 42, churned: 2 }
];

export const subscriptionPlanDistribution = [
  { name: "Growth Pro", value: 172, color: "#2563EB", mrrShare: 24500 },
  { name: "Enterprise Plus", value: 86, color: "#172554", mrrShare: 21500 },
  { name: "Starter Standard", value: 84, color: "#64748B", mrrShare: 5250 }
];

export const initialAiSuggestions = [
  "What is our projected revenue at risk for the next 30 days?",
  "Which 3 customers have overdue balances requiring executive escalation?",
  "Break down our current MRR growth vs churn rate this quarter.",
  "How much revenue has Revenue Shield recovered over the last 90 days?"
];

export const initialAiMessages = [
  {
    id: "msg_1",
    sender: "assistant",
    timestamp: "10:14 AM",
    content: "Welcome to SubscriptIQ Business Intelligence. I am your subscription copilot. I continuously monitor your billing engine, active dunning sequences, and cash flow risk across all customer accounts. How can I assist your financial operations today?"
  }
];

