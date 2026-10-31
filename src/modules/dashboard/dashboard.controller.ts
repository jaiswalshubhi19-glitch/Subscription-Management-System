import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service.js';
import { sendSuccess } from '../../utils/response.js';

export class DashboardController {
  static async getSummary(req: Request, res: Response): Promise<void> {
    const summary = await DashboardService.getSummary(req.organizationId!);
    sendSuccess(res, summary);
  }
}
