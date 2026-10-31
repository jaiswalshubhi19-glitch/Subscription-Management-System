import { Request, Response } from 'express';
import { NotificationService } from './notification.service.js';
import { sendSuccess } from '../../utils/response.js';

export class NotificationController {
  static async list(req: Request, res: Response): Promise<void> {
    const notifications = await NotificationService.list(req.organizationId!, req.user?.id);
    sendSuccess(res, notifications);
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    const updated = await NotificationService.markAsRead(req.params.id, req.organizationId!);
    sendSuccess(res, updated, 200, undefined, 'Notification marked as read');
  }

  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    const result = await NotificationService.markAllAsRead(req.organizationId!, req.user?.id);
    sendSuccess(res, { count: result.count }, 200, undefined, 'All notifications marked as read');
  }
}
