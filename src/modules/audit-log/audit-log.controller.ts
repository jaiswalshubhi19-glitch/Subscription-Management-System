import { Request, Response } from 'express';
import { AuditLogService } from './audit-log.service.js';
import { sendSuccess } from '../../utils/response.js';

export class AuditLogController {
  static async list(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const entity = req.query.entity as string | undefined;
    const action = req.query.action as string | undefined;

    const result = await AuditLogService.list(req.organizationId!, {
      page,
      limit,
      entity,
      action,
    });

    sendSuccess(res, result.logs, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }
}
