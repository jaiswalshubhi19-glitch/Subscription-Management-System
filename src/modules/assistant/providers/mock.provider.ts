import { AIProvider } from './ai-provider.interface.js';

export class DeterministicMockProvider implements AIProvider {
  name = 'DeterministicMockAI';

  isConfigured(): boolean {
    return true;
  }

  async generateExplanation(
    question: string,
    verifiedContext: Record<string, unknown>
  ): Promise<string> {
    const q = question.toLowerCase();
    const metrics = (verifiedContext.metrics as Record<string, unknown>) || {};
    const org = (verifiedContext.organization as Record<string, unknown>) || {};
    const issues = (verifiedContext.issues as Array<Record<string, unknown>>) || [];

    const mrr = metrics.mrrFormatted ?? '0.00';
    const arr = metrics.arrFormatted ?? '0.00';
    const currency = org.currency || 'USD';
    const activeSubs = metrics.activeSubscriptions ?? 0;
    const churn = metrics.churnRatePercent ?? 0;
    const balance = metrics.outstandingBalanceFormatted ?? '0.00';
    const openIssuesCount = issues.length;

    if (q.includes('mrr') || q.includes('monthly recurring revenue')) {
      return (
        `Based on verified live subscriptions for ${org.name || 'your organization'}, your Monthly Recurring Revenue (MRR) is ` +
        `**${currency} ${mrr}**, which annualizes to an estimated ARR of **${currency} ${arr}**. ` +
        `This is driven by ${activeSubs} active subscription contract(s).`
      );
    }

    if (q.includes('arr') || q.includes('annual')) {
      return (
        `Your Annual Recurring Revenue (ARR) is currently **${currency} ${arr}** (calculated as 12x of current normalized MRR ${currency} ${mrr}). ` +
        `Note: This calculation assumes steady-state retention without factoring unearned prospective churn.`
      );
    }

    if (q.includes('churn') || q.includes('retention') || q.includes('cancel')) {
      return (
        `Your current churn rate is **${churn}%** for this billing cycle, with ${metrics.canceledSubscriptionsThisMonth ?? 0} canceled ` +
        `contract(s) compared to ${metrics.newSubscriptionsThisMonth ?? 0} new customer sign-ups.`
      );
    }

    if (q.includes('overdue') || q.includes('unpaid') || q.includes('owed') || q.includes('leak') || q.includes('protect')) {
      if (openIssuesCount > 0) {
        return (
          `Revenue Protection has flagged **${openIssuesCount} active issue(s)** with **${currency} ${balance}** in outstanding uncollected balances. ` +
          `Key detected issues include: ${issues.map((i) => i.title).slice(0, 3).join(', ')}. ` +
          `Recommendation: Review the Revenue Protection dashboard to resolve overdue collections and avoid service leakage.`
        );
      } else {
        return `All invoices and renewals are healthy! There are currently no unresolved revenue leak issues or overdue balances.`;
      }
    }

    return (
      `Here is a verified summary for **${org.name || 'SubscriptIQ'}**:\n` +
      `- **MRR**: ${currency} ${mrr}\n` +
      `- **ARR**: ${currency} ${arr}\n` +
      `- **Active Subscriptions**: ${activeSubs}\n` +
      `- **Outstanding Balance Due**: ${currency} ${balance}\n` +
      `- **Active Revenue Leaks / Issues**: ${openIssuesCount}\n` +
      `Ask me about your subscription growth, churn trends, or pending invoice collections for deeper insights.`
    );
  }
}
