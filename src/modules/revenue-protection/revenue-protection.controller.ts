import { Request, Response } from 'express';
import { RevenueProtectionService } from './revenue-protection.service.js';
import { sendSuccess } from '../../utils/response.js';
import { IssueSeverity, IssueStatus, ProtectionIssueType } from '@prisma/client';

export class RevenueProtectionController {
  static async getOverview(req: Request, res: Response): Promise<void> {
    const overview = await RevenueProtectionService.getOverview(req.organizationId!);
    sendSuccess(res, overview);
  }

  static async listIssues(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as IssueStatus | undefined;
    const severity = req.query.severity as IssueSeverity | undefined;
    const issueType = req.query.issueType as ProtectionIssueType | undefined;

    const result = await RevenueProtectionService.listIssues(req.organizationId!, {
      page,
      limit,
      status,
      severity,
      issueType,
    });

    sendSuccess(res, result.issues, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }

  static async getUpcomingRenewals(req: Request, res: Response): Promise<void> {
    const renewals = await RevenueProtectionService.getUpcomingRenewals(req.organizationId!);
    sendSuccess(res, renewals);
  }

  static async resolveIssue(req: Request, res: Response): Promise<void> {
    const resolved = await RevenueProtectionService.resolveIssue(
      req.organizationId!,
      req.params.id,
      req.body,
      req.user?.email
    );
    sendSuccess(res, resolved, 200, undefined, 'Issue status updated successfully');
  }

  static async runScan(req: Request, res: Response): Promise<void> {
    const count = await RevenueProtectionService.runDeterministicAudit(req.organizationId!);
    sendSuccess(res, { newIssuesDetected: count }, 200, undefined, 'Revenue protection scan completed');
  }
}
