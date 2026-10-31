import { Request, Response } from 'express';
import { CustomerService } from './customer.service.js';
import { sendSuccess } from '../../utils/response.js';

export class CustomerController {
  static async list(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search as string | undefined;

    const result = await CustomerService.list(req.organizationId!, {
      page,
      limit,
      search,
    });

    sendSuccess(res, result.customers, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const customer = await CustomerService.getById(req.organizationId!, req.params.id);
    sendSuccess(res, customer);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const customer = await CustomerService.create(
      req.organizationId!,
      req.body,
      req.user?.id
    );
    sendSuccess(res, customer, 201, undefined, 'Customer created successfully');
  }

  static async update(req: Request, res: Response): Promise<void> {
    const updated = await CustomerService.update(
      req.organizationId!,
      req.params.id,
      req.body,
      req.user?.id
    );
    sendSuccess(res, updated, 200, undefined, 'Customer updated successfully');
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const result = await CustomerService.delete(
      req.organizationId!,
      req.params.id,
      req.user?.id
    );
    sendSuccess(res, result, 200, undefined, result.message);
  }
}
