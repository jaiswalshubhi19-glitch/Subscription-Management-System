import { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import { sendSuccess } from '../../utils/response.js';
import { ProductType } from '@prisma/client';

export class ProductController {
  static async list(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search as string | undefined;
    const type = req.query.type as ProductType | undefined;

    const result = await ProductService.list(req.organizationId!, {
      page,
      limit,
      search,
      type,
    });

    sendSuccess(res, result.products, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const product = await ProductService.getById(req.organizationId!, req.params.id);
    sendSuccess(res, product);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const product = await ProductService.create(
      req.organizationId!,
      req.body,
      req.user?.id
    );
    sendSuccess(res, product, 201, undefined, 'Product created successfully');
  }

  static async update(req: Request, res: Response): Promise<void> {
    const updated = await ProductService.update(
      req.organizationId!,
      req.params.id,
      req.body,
      req.user?.id
    );
    sendSuccess(res, updated, 200, undefined, 'Product updated successfully');
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const result = await ProductService.delete(
      req.organizationId!,
      req.params.id,
      req.user?.id
    );
    sendSuccess(res, result, 200, undefined, result.message);
  }
}
