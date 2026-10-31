import { DashboardService } from '../dashboard/dashboard.service.js';
import { RevenueProtectionService } from '../revenue-protection/revenue-protection.service.js';
import { OrgService } from '../organization/org.service.js';
import { GrokProvider } from './providers/grok.provider.js';
import { DeterministicMockProvider } from './providers/mock.provider.js';
import { logger } from '../../utils/logger.js';

export class AssistantService {
  private static grokProvider = new GrokProvider();
  private static mockProvider = new DeterministicMockProvider();

  static async chat(organizationId: string, question: string) {
    // 1. Gather verified financial context from backend
    const [summary, protectionOverview, org] = await Promise.all([
      DashboardService.getSummary(organizationId),
      RevenueProtectionService.getOverview(organizationId),
      OrgService.getOrganization(organizationId),
    ]);

    // Build verified non-PII context payload
    const verifiedContext = {
      organization: {
        name: org.name,
        currency: org.currency,
      },
      metrics: summary.metrics,
      revenueProtection: {
        totalOpenIssues: protectionOverview.totalOpenIssues,
        revenueAtRiskFormatted: protectionOverview.revenueAtRiskFormatted,
        criticalCount: protectionOverview.criticalCount,
        breakdownByType: protectionOverview.breakdownByType,
      },
      issues: protectionOverview.recentIssues.map((i) => ({
        title: i.title,
        severity: i.severity,
        type: i.issueType,
      })),
    };

    let explanation: string;
    let providerUsed: string;

    // 2. Select AI Provider with automatic resilient fallback
    if (this.grokProvider.isConfigured()) {
      try {
        explanation = await this.grokProvider.generateExplanation(question, verifiedContext);
        providerUsed = this.grokProvider.name;
      } catch {
        logger.info('Falling back to deterministic mock AI provider');
        explanation = await this.mockProvider.generateExplanation(question, verifiedContext);
        providerUsed = this.mockProvider.name;
      }
    } else {
      explanation = await this.mockProvider.generateExplanation(question, verifiedContext);
      providerUsed = this.mockProvider.name;
    }

    return {
      explanation,
      verifiedMetrics: summary.metrics,
      providerUsed,
      timestamp: new Date().toISOString(),
    };
  }
}
