import { Request, Response } from 'express';
import { PaymentService } from './payment.service.js';
import { sendSuccess } from '../../utils/response.js';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class PaymentController {
  static async list(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as PaymentStatus | undefined;
    const customerId = req.query.customerId as string | undefined;
    const method = req.query.method as PaymentMethod | undefined;

    const result = await PaymentService.list(req.organizationId!, {
      page,
      limit,
      status,
      customerId,
      method,
    });

    sendSuccess(res, result.payments, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const payment = await PaymentService.getById(req.organizationId!, req.params.id);
    sendSuccess(res, payment);
  }

  static async recordPayment(req: Request, res: Response): Promise<void> {
    const payment = await PaymentService.recordPayment(
      req.organizationId!,
      req.body,
      req.user?.id
    );
    sendSuccess(res, payment, 201, undefined, 'Payment recorded successfully');
  }

  static async refundPayment(req: Request, res: Response): Promise<void> {
    const updated = await PaymentService.refundPayment(
      req.organizationId!,
      req.params.id,
      req.body,
      req.user?.id
    );
    sendSuccess(res, updated, 200, undefined, 'Payment refund processed');
  }
}
