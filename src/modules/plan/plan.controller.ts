import { Request, Response } from 'express';
import { PlanService } from './plan.service.js';
import { sendSuccess } from '../../utils/response.js';
import { BillingInterval } from '@prisma/client';

export class PlanController {
  static async list(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const productId = req.query.productId as string | undefined;
    const billingInterval = req.query.billingInterval as BillingInterval | undefined;
    const search = req.query.search as string | undefined;

    const result = await PlanService.list(req.organizationId!, {
      page,
      limit,
      productId,
      billingInterval,
      search,
    });

    sendSuccess(res, result.plans, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const plan = await PlanService.getById(req.organizationId!, req.params.id);
    sendSuccess(res, plan);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const plan = await PlanService.create(
      req.organizationId!,
      req.body,
      req.user?.id
    );
    sendSuccess(res, plan, 201, undefined, 'Plan created successfully');
  }

  static async update(req: Request, res: Response): Promise<void> {
    const updated = await PlanService.update(
      req.organizationId!,
      req.params.id,
      req.body,
      req.user?.id
    );
    sendSuccess(res, updated, 200, undefined, 'Plan updated successfully');
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const result = await PlanService.delete(
      req.organizationId!,
      req.params.id,
      req.user?.id
    );
    sendSuccess(res, result, 200, undefined, result.message);
  }
}
