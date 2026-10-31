import { Request, Response } from 'express';
import { AssistantService } from './assistant.service.js';
import { sendSuccess } from '../../utils/response.js';

export class AssistantController {
  static async chat(req: Request, res: Response): Promise<void> {
    const { message } = req.body;
    const result = await AssistantService.chat(req.organizationId!, message);
    sendSuccess(res, result);
  }
}
