import { prisma } from '../../prisma/client.js';

export class DashboardService {
  static async getSummary(organizationId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 1. Fetch Active Subscriptions for MRR calculation
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        organizationId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: {
        plan: true,
      },
    });

    let mrrMinor = 0;
    for (const sub of activeSubscriptions) {
      const lineCost = sub.quantity * sub.unitPrice;
      switch (sub.plan.billingInterval) {
        case 'DAILY':
          mrrMinor += lineCost * 30;
          break;
        case 'WEEKLY':
          mrrMinor += Math.round((lineCost * 52) / 12);
          break;
        case 'MONTHLY':
          mrrMinor += Math.round(lineCost / sub.plan.intervalCount);
          break;
        case 'QUARTERLY':
          mrrMinor += Math.round(lineCost / 3);
          break;
        case 'YEARLY':
          mrrMinor += Math.round(lineCost / 12);
          break;
      }
    }

    const arrMinor = mrrMinor * 12;

    // 2. Counts and Totals in Parallel
    const [
      totalCustomers,
      newSubscriptionsCount,
      canceledSubscriptionsCount,
      outstandingInvoices,
      collectedPayments,
      upcomingRenewalsCount,
      openIssuesCount,
    ] = await Promise.all([
      prisma.customer.count({ where: { organizationId } }),
      prisma.subscription.count({
        where: {
          organizationId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.subscription.count({
        where: {
          organizationId,
          status: 'CANCELED',
          canceledAt: { gte: startOfMonth },
        },
      }),
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: { in: ['OPEN', 'OVERDUE'] },
        },
        _sum: { amountDue: true },
        _count: { id: true },
      }),
      prisma.payment.aggregate({
        where: {
          organizationId,
          status: 'SUCCEEDED',
          paidAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.subscription.count({
        where: {
          organizationId,
          status: 'ACTIVE',
          renewalDate: { gte: now, lte: thirtyDaysAhead },
        },
      }),
      prisma.revenueProtectionIssue.count({
        where: {
          organizationId,
          status: { in: ['OPEN', 'INVESTIGATING'] },
        },
      }),
    ]);

    // Churn rate calculation
    const totalActive = activeSubscriptions.length;
    const denominator = totalActive + canceledSubscriptionsCount;
    const churnRate =
      denominator > 0 ? Number(((canceledSubscriptionsCount / denominator) * 100).toFixed(2)) : 0;

    const outstandingBalanceMinor = outstandingInvoices._sum.amountDue || 0;
    const collectedRevenueMinor = collectedPayments._sum.amount || 0;

    // Recent Activity Feed
    const [recentInvoices, recentPayments] = await Promise.all([
      prisma.invoice.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true } } },
      }),
      prisma.payment.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { paidAt: 'desc' },
        include: { customer: { select: { name: true } } },
      }),
    ]);

    return {
      metrics: {
        mrrMinor,
        mrrFormatted: (mrrMinor / 100).toFixed(2),
        arrMinor,
        arrFormatted: (arrMinor / 100).toFixed(2),
        activeSubscriptions: totalActive,
        totalCustomers,
        newSubscriptionsThisMonth: newSubscriptionsCount,
        canceledSubscriptionsThisMonth: canceledSubscriptionsCount,
        churnRatePercent: churnRate,
        outstandingBalanceMinor,
        outstandingBalanceFormatted: (outstandingBalanceMinor / 100).toFixed(2),
        unpaidInvoicesCount: outstandingInvoices._count.id,
        collectedRevenueThisMonthMinor: collectedRevenueMinor,
        collectedRevenueThisMonthFormatted: (collectedRevenueMinor / 100).toFixed(2),
        upcomingRenewalsCount,
        openProtectionIssuesCount: openIssuesCount,
      },
      recentActivity: {
        invoices: recentInvoices,
        payments: recentPayments,
      },
    };
  }
}
