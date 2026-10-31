import { Request, Response } from 'express';
import { InvoiceService } from './invoice.service.js';
import { sendSuccess } from '../../utils/response.js';
import { InvoiceStatus } from '@prisma/client';

export class InvoiceController {
  static async list(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as InvoiceStatus | undefined;
    const customerId = req.query.customerId as string | undefined;
    const subscriptionId = req.query.subscriptionId as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await InvoiceService.list(req.organizationId!, {
      page,
      limit,
      status,
      customerId,
      subscriptionId,
      search,
    });

    sendSuccess(res, result.invoices, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const invoice = await InvoiceService.getById(req.organizationId!, req.params.id);
    sendSuccess(res, invoice);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const invoice = await InvoiceService.create(
      req.organizationId!,
      req.body,
      req.user?.id
    );
    sendSuccess(res, invoice, 201, undefined, 'Invoice created successfully');
  }

  static async voidInvoice(req: Request, res: Response): Promise<void> {
    const updated = await InvoiceService.voidInvoice(
      req.organizationId!,
      req.params.id,
      req.user?.id
    );
    sendSuccess(res, updated, 200, undefined, 'Invoice voided successfully');
  }
}
