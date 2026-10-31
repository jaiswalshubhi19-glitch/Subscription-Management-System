import { IssueSeverity, IssueStatus, ProtectionIssueType, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client.js';
import { AppError } from '../../utils/app-error.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { NotificationService } from '../notification/notification.service.js';

export class RevenueProtectionService {
  /**
   * Run all deterministic revenue leak checks and persist new issues
   */
  static async runDeterministicAudit(organizationId: string) {
    const now = new Date();
    let newIssuesCount = 0;

    // 1. Check for Overdue Invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ['OPEN', 'OVERDUE'] },
        dueDate: { lt: now },
      },
      include: { customer: true, subscription: true },
    });

    for (const inv of overdueInvoices) {
      // Mark as OVERDUE if still OPEN
      if (inv.status === 'OPEN') {
        await prisma.invoice.update({
          where: { id: inv.id },
          data: { status: 'OVERDUE' },
        });

        // Also mark linked subscription as PAST_DUE if active
        if (inv.subscriptionId) {
          await prisma.subscription.updateMany({
            where: { id: inv.subscriptionId, status: 'ACTIVE' },
            data: { status: 'PAST_DUE' },
          });
        }
      }

      const daysOverdue = Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      let severity: IssueSeverity = 'LOW';
      if (daysOverdue > 30) severity = 'CRITICAL';
      else if (daysOverdue > 14) severity = 'HIGH';
      else if (daysOverdue > 3) severity = 'MEDIUM';

      // Check if open issue already logged for this invoice
      const existing = await prisma.revenueProtectionIssue.findFirst({
        where: {
          organizationId,
          invoiceId: inv.id,
          issueType: 'OVERDUE_INVOICE',
          status: { in: ['OPEN', 'INVESTIGATING'] },
        },
      });

      if (!existing) {
        await prisma.revenueProtectionIssue.create({
          data: {
            organizationId,
            issueType: 'OVERDUE_INVOICE',
            severity,
            customerId: inv.customerId,
            subscriptionId: inv.subscriptionId,
            invoiceId: inv.id,
            title: `Unpaid Overdue Invoice ${inv.invoiceNumber}`,
            description: `Invoice ${inv.invoiceNumber} for ${inv.customer.name} is ${daysOverdue} days past due with an unpaid balance of ${(inv.amountDue / 100).toFixed(2)} ${inv.currency}.`,
            suggestedAction: 'Send automated dunning payment reminder or contact customer billing contact.',
            metadata: { daysOverdue, amountDue: inv.amountDue },
          },
        });
        newIssuesCount++;
      }
    }

    // 2. Check for Duplicate Invoices (same customer, same total amount within 48h)
    const recentInvoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        status: { not: 'VOID' },
        createdAt: { gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });

    for (let i = 0; i < recentInvoices.length; i++) {
      for (let j = i + 1; j < recentInvoices.length; j++) {
        const invA = recentInvoices[i];
        const invB = recentInvoices[j];

        if (
          invA.customerId === invB.customerId &&
          invA.total === invB.total &&
          invA.id !== invB.id
        ) {
          const diffHours = Math.abs(invA.createdAt.getTime() - invB.createdAt.getTime()) / (1000 * 60 * 60);
          if (diffHours <= 48) {
            const existingIssue = await prisma.revenueProtectionIssue.findFirst({
              where: {
                organizationId,
                invoiceId: invA.id,
                issueType: 'DUPLICATE_INVOICE',
                status: { in: ['OPEN', 'INVESTIGATING'] },
              },
            });

            if (!existingIssue) {
              await prisma.revenueProtectionIssue.create({
                data: {
                  organizationId,
                  issueType: 'DUPLICATE_INVOICE',
                  severity: 'HIGH',
                  customerId: invA.customerId,
                  invoiceId: invA.id,
                  title: `Potential Duplicate Invoices (${invA.invoiceNumber} & ${invB.invoiceNumber})`,
                  description: `Invoices ${invA.invoiceNumber} and ${invB.invoiceNumber} were issued to ${invA.customer.name} within ${Math.round(diffHours)} hours for the identical amount of ${(invA.total / 100).toFixed(2)} ${invA.currency}.`,
                  suggestedAction: 'Verify billing cycles with customer and void duplicate invoice if unnecessary.',
                  metadata: { duplicateInvoiceId: invB.id, invoiceNumbers: [invA.invoiceNumber, invB.invoiceNumber] },
                },
              });
              newIssuesCount++;
            }
          }
        }
      }
    }

    // 3. Check for Revenue Inconsistencies (math mismatch)
    const allInvoices = await prisma.invoice.findMany({
      where: { organizationId },
      include: { items: true },
      take: 200,
      orderBy: { createdAt: 'desc' },
    });

    for (const inv of allInvoices) {
      const expectedTotal = Math.max(0, inv.subtotal - inv.discountTotal) + inv.taxTotal;
      const expectedDue = Math.max(0, inv.total - inv.amountPaid);

      if (inv.total !== expectedTotal || (inv.status !== 'VOID' && inv.amountDue !== expectedDue)) {
        const existing = await prisma.revenueProtectionIssue.findFirst({
          where: {
            organizationId,
            invoiceId: inv.id,
            issueType: 'REVENUE_INCONSISTENCY',
            status: { in: ['OPEN', 'INVESTIGATING'] },
          },
        });

        if (!existing) {
          await prisma.revenueProtectionIssue.create({
            data: {
              organizationId,
              issueType: 'REVENUE_INCONSISTENCY',
              severity: 'CRITICAL',
              customerId: inv.customerId,
              invoiceId: inv.id,
              title: `Math Discrepancy on Invoice ${inv.invoiceNumber}`,
              description: `Recorded invoice total (${inv.total}) does not match line item calculations (${expectedTotal}) or balance due (${inv.amountDue} vs expected ${expectedDue}).`,
              suggestedAction: 'Audit line items, tax rates, and recalculate invoice totals.',
              metadata: { recordedTotal: inv.total, expectedTotal, recordedDue: inv.amountDue, expectedDue },
            },
          });
          newIssuesCount++;
        }
      }
    }

    // 4. Check for Past Due Subscriptions without Active Billing Resolution
    const pastDueSubs = await prisma.subscription.findMany({
      where: { organizationId, status: 'PAST_DUE' },
      include: { customer: true, plan: true },
    });

    for (const sub of pastDueSubs) {
      const existing = await prisma.revenueProtectionIssue.findFirst({
        where: {
          organizationId,
          subscriptionId: sub.id,
          issueType: 'PAST_DUE_SUBSCRIPTION',
          status: { in: ['OPEN', 'INVESTIGATING'] },
        },
      });

      if (!existing) {
        await prisma.revenueProtectionIssue.create({
          data: {
            organizationId,
            issueType: 'PAST_DUE_SUBSCRIPTION',
            severity: 'HIGH',
            customerId: sub.customerId,
            subscriptionId: sub.id,
            title: `Past-Due Subscription Contract ${sub.subscriptionNumber}`,
            description: `Subscription ${sub.subscriptionNumber} (${sub.plan.name}) for customer ${sub.customer.name} is in PAST_DUE status with outstanding unpaid renewal cycles.`,
            suggestedAction: 'Chase unpaid invoices or pause subscription to prevent unrecovered service delivery.',
            metadata: { subscriptionNumber: sub.subscriptionNumber, planName: sub.plan.name },
          },
        });
        newIssuesCount++;
      }
    }

    return newIssuesCount;
  }

  static async getOverview(organizationId: string) {
    // Run audit to capture latest state
    await this.runDeterministicAudit(organizationId);

    const issues = await prisma.revenueProtectionIssue.findMany({
      where: { organizationId, status: { in: ['OPEN', 'INVESTIGATING'] } },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        invoice: { select: { id: true, invoiceNumber: true, amountDue: true, total: true, currency: true } },
        subscription: { select: { id: true, subscriptionNumber: true } },
      },
      orderBy: { detectedAt: 'desc' },
    });

    let totalAtRisk = 0;
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    const byType: Record<string, number> = {};

    for (const issue of issues) {
      if (issue.invoice?.amountDue) {
        totalAtRisk += issue.invoice.amountDue;
      }

      if (issue.severity === 'CRITICAL') criticalCount++;
      else if (issue.severity === 'HIGH') highCount++;
      else if (issue.severity === 'MEDIUM') mediumCount++;
      else lowCount++;

      byType[issue.issueType] = (byType[issue.issueType] || 0) + 1;
    }

    return {
      totalOpenIssues: issues.length,
      revenueAtRiskMinor: totalAtRisk,
      revenueAtRiskFormatted: (totalAtRisk / 100).toFixed(2),
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      breakdownByType: byType,
      recentIssues: issues.slice(0, 10),
    };
  }

  static async listIssues(
    organizationId: string,
    options: {
      page: number;
      limit: number;
      status?: IssueStatus;
      severity?: IssueSeverity;
      issueType?: ProtectionIssueType;
    }
  ) {
    const skip = (options.page - 1) * options.limit;

    const where: Prisma.RevenueProtectionIssueWhereInput = {
      organizationId,
      ...(options.status ? { status: options.status } : {}),
      ...(options.severity ? { severity: options.severity } : {}),
      ...(options.issueType ? { issueType: options.issueType } : {}),
    };

    const [total, issues] = await Promise.all([
      prisma.revenueProtectionIssue.count({ where }),
      prisma.revenueProtectionIssue.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: [{ severity: 'desc' }, { detectedAt: 'desc' }],
        include: {
          customer: { select: { id: true, name: true, email: true, company: true } },
          invoice: { select: { id: true, invoiceNumber: true, total: true, amountDue: true, currency: true } },
          subscription: { select: { id: true, subscriptionNumber: true, status: true } },
          payment: { select: { id: true, paymentNumber: true, amount: true } },
        },
      }),
    ]);

    return {
      issues,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  static async getUpcomingRenewals(organizationId: string) {
    const now = new Date();
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        organizationId,
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
        renewalDate: {
          gte: now,
          lte: thirtyDaysAhead,
        },
      },
      include: {
        customer: {
          include: {
            invoices: {
              where: { status: 'OVERDUE' },
              select: { id: true, amountDue: true },
            },
          },
        },
        plan: { include: { product: true } },
      },
      orderBy: { renewalDate: 'asc' },
    });

    return subscriptions.map((sub) => {
      const overdueInvoiceCount = sub.customer.invoices.length;
      const totalOverdue = sub.customer.invoices.reduce((acc, curr) => acc + curr.amountDue, 0);

      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (overdueInvoiceCount > 1 || totalOverdue > 10000) riskLevel = 'HIGH';
      else if (overdueInvoiceCount === 1) riskLevel = 'MEDIUM';

      return {
        id: sub.id,
        subscriptionNumber: sub.subscriptionNumber,
        customerName: sub.customer.name,
        customerEmail: sub.customer.email,
        company: sub.customer.company,
        planName: sub.plan.name,
        productName: sub.plan.product.name,
        renewalDate: sub.renewalDate,
        amount: sub.quantity * sub.unitPrice,
        currency: sub.currency,
        status: sub.status,
        riskLevel,
        hasOverdueInvoices: overdueInvoiceCount > 0,
        overdueBalance: totalOverdue,
      };
    });
  }

  static async resolveIssue(
    organizationId: string,
    id: string,
    data: { status: IssueStatus; resolutionNotes: string },
    userEmail?: string
  ) {
    const issue = await prisma.revenueProtectionIssue.findFirst({
      where: { id, organizationId },
    });

    if (!issue) {
      throw AppError.notFound('Revenue protection issue not found');
    }

    const updated = await prisma.revenueProtectionIssue.update({
      where: { id },
      data: {
        status: data.status,
        resolutionNotes: data.resolutionNotes,
        resolvedAt: data.status === 'RESOLVED' || data.status === 'DISMISSED' ? new Date() : null,
        resolvedBy: userEmail,
      },
    });

    await AuditLogService.record({
      organizationId,
      action: 'REVENUE_ISSUE_RESOLVED',
      entity: 'RevenueProtectionIssue',
      entityId: id,
      newValues: { status: data.status, notes: data.resolutionNotes },
    });

    return updated;
  }
}
