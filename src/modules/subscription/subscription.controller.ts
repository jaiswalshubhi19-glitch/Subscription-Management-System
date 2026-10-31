import { Request, Response } from 'express';
import { SubscriptionService } from './subscription.service.js';
import { sendSuccess } from '../../utils/response.js';
import { SubscriptionStatus } from '@prisma/client';

export class SubscriptionController {
  static async list(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as SubscriptionStatus | undefined;
    const customerId = req.query.customerId as string | undefined;
    const planId = req.query.planId as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await SubscriptionService.list(req.organizationId!, {
      page,
      limit,
      status,
      customerId,
      planId,
      search,
    });

    sendSuccess(res, result.subscriptions, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const subscription = await SubscriptionService.getById(req.organizationId!, req.params.id);
    sendSuccess(res, subscription);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const result = await SubscriptionService.create(
      req.organizationId!,
      req.body,
      req.user?.id
    );
    sendSuccess(res, result, 201, undefined, 'Subscription created successfully');
  }

  static async update(req: Request, res: Response): Promise<void> {
    const updated = await SubscriptionService.update(
      req.organizationId!,
      req.params.id,
      req.body,
      req.user?.id
    );
    sendSuccess(res, updated, 200, undefined, 'Subscription updated successfully');
  }

  static async cancel(req: Request, res: Response): Promise<void> {
    const updated = await SubscriptionService.cancel(
      req.organizationId!,
      req.params.id,
      req.body,
      req.user?.id
    );
    sendSuccess(res, updated, 200, undefined, 'Subscription cancellation processed');
  }

  static async renew(req: Request, res: Response): Promise<void> {
    const result = await SubscriptionService.renew(
      req.organizationId!,
      req.params.id,
      req.user?.id
    );
    sendSuccess(res, result, 200, undefined, 'Subscription renewed and invoice generated');
  }

  static async pause(req: Request, res: Response): Promise<void> {
    const updated = await SubscriptionService.pause(
      req.organizationId!,
      req.params.id,
      req.user?.id
    );
    sendSuccess(res, updated, 200, undefined, 'Subscription paused successfully');
  }

  static async resume(req: Request, res: Response): Promise<void> {
    const updated = await SubscriptionService.resume(
      req.organizationId!,
      req.params.id,
      req.user?.id
    );
    sendSuccess(res, updated, 200, undefined, 'Subscription resumed successfully');
  }
}
