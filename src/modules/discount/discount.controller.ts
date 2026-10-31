import { Request, Response } from 'express';
import { DiscountService } from './discount.service.js';
import { sendSuccess } from '../../utils/response.js';

export class DiscountController {
  static async list(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search as string | undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

    const result = await DiscountService.list(req.organizationId!, {
      page,
      limit,
      search,
      isActive,
    });

    sendSuccess(res, result.discounts, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const discount = await DiscountService.getById(req.organizationId!, req.params.id);
    sendSuccess(res, discount);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const discount = await DiscountService.create(
      req.organizationId!,
      req.body,
      req.user?.id
    );
    sendSuccess(res, discount, 201, undefined, 'Discount created successfully');
  }

  static async update(req: Request, res: Response): Promise<void> {
    const updated = await DiscountService.update(
      req.organizationId!,
      req.params.id,
      req.body,
      req.user?.id
    );
    sendSuccess(res, updated, 200, undefined, 'Discount updated successfully');
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const result = await DiscountService.delete(
      req.organizationId!,
      req.params.id,
      req.user?.id
    );
    sendSuccess(res, result, 200, undefined, result.message);
  }
}
