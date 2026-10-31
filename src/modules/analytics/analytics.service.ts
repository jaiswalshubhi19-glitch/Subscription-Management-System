import { prisma } from '../../prisma/client.js';

export class AnalyticsService {
  static async getRevenueAnalytics(organizationId: string, months = 6) {
    const now = new Date();
    const trendData = [];

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const [invoices, payments] = await Promise.all([
        prisma.invoice.aggregate({
          where: {
            organizationId,
            status: { not: 'VOID' },
            createdAt: { gte: start, lte: end },
          },
          _sum: { total: true },
        }),
        prisma.payment.aggregate({
          where: {
            organizationId,
            status: 'SUCCEEDED',
            paidAt: { gte: start, lte: end },
          },
          _sum: { amount: true },
        }),
      ]);

      const billed = invoices._sum.total || 0;
      const collected = payments._sum.amount || 0;
      const monthLabel = start.toLocaleString('default', { month: 'short', year: 'numeric' });

      trendData.push({
        month: monthLabel,
        invoicedMinor: billed,
        invoicedFormatted: (billed / 100).toFixed(2),
        collectedMinor: collected,
        collectedFormatted: (collected / 100).toFixed(2),
      });
    }

    return {
      timeframeMonths: months,
      trends: trendData,
    };
  }

  static async getSubscriptionAnalytics(organizationId: string) {
    const [byStatus, byPlan] = await Promise.all([
      prisma.subscription.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: { id: true },
      }),
      prisma.subscription.groupBy({
        by: ['planId'],
        where: { organizationId, status: { in: ['ACTIVE', 'TRIALING'] } },
        _count: { id: true },
        _sum: { quantity: true },
      }),
    ]);

    // Populate plan names
    const planIds = byPlan.map((p) => p.planId);
    const plans = await prisma.plan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, name: true, price: true, currency: true },
    });

    const planMap = new Map(plans.map((p) => [p.id, p]));

    const planBreakdown = byPlan.map((p) => {
      const plan = planMap.get(p.planId);
      return {
        planId: p.planId,
        planName: plan?.name || 'Unknown',
        activeCount: p._count.id,
        totalQuantity: p._sum.quantity || 0,
        unitPrice: plan?.price || 0,
      };
    });

    return {
      statusBreakdown: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      planBreakdown,
    };
  }

  static async getCustomerAnalytics(organizationId: string) {
    // Top customers by payments
    const topCustomers = await prisma.customer.findMany({
      where: { organizationId },
      include: {
        payments: {
          where: { status: 'SUCCEEDED' },
          select: { amount: true },
        },
        _count: {
          select: { subscriptions: true, invoices: true },
        },
      },
      take: 50,
    });

    const formatted = topCustomers
      .map((c) => {
        const lifetimePaidMinor = c.payments.reduce((acc, p) => acc + p.amount, 0);
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          company: c.company,
          customerNumber: c.customerNumber,
          lifetimePaidMinor,
          lifetimePaidFormatted: (lifetimePaidMinor / 100).toFixed(2),
          activeSubscriptionsCount: c._count.subscriptions,
          invoicesCount: c._count.invoices,
        };
      })
      .sort((a, b) => b.lifetimePaidMinor - a.lifetimePaidMinor)
      .slice(0, 10);

    return {
      topCustomers: formatted,
    };
  }

  static async getChurnAnalytics(organizationId: string) {
    const now = new Date();
    const months = 6;
    const churnHistory = [];

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const [activeStart, canceledInMonth] = await Promise.all([
        prisma.subscription.count({
          where: {
            organizationId,
            createdAt: { lte: start },
            OR: [
              { canceledAt: null },
              { canceledAt: { gt: start } },
            ],
          },
        }),
        prisma.subscription.count({
          where: {
            organizationId,
            status: 'CANCELED',
            canceledAt: { gte: start, lte: end },
          },
        }),
      ]);

      const rate = activeStart > 0 ? Number(((canceledInMonth / activeStart) * 100).toFixed(2)) : 0;
      const monthLabel = start.toLocaleString('default', { month: 'short', year: 'numeric' });

      churnHistory.push({
        month: monthLabel,
        activeSubscriptionsAtStart: activeStart,
        canceledInMonth,
        churnRatePercent: rate,
      });
    }

    return {
      historicalChurn: churnHistory,
    };
  }
}
