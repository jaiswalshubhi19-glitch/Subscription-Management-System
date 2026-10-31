import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { sendSuccess } from '../../utils/response.js';

export class AnalyticsController {
  static async getRevenue(req: Request, res: Response): Promise<void> {
    const months = Number(req.query.months) || 6;
    const analytics = await AnalyticsService.getRevenueAnalytics(req.organizationId!, months);
    sendSuccess(res, analytics);
  }

  static async getSubscriptions(req: Request, res: Response): Promise<void> {
    const analytics = await AnalyticsService.getSubscriptionAnalytics(req.organizationId!);
    sendSuccess(res, analytics);
  }

  static async getCustomers(req: Request, res: Response): Promise<void> {
    const analytics = await AnalyticsService.getCustomerAnalytics(req.organizationId!);
    sendSuccess(res, analytics);
  }

  static async getChurn(req: Request, res: Response): Promise<void> {
    const analytics = await AnalyticsService.getChurnAnalytics(req.organizationId!);
    sendSuccess(res, analytics);
  }
}
