import { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import { AUTH_COOKIE_NAME } from '../../config/constants.js';
import { env } from '../../config/env.js';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await AuthService.register({
      ...req.body,
      ipAddress,
      userAgent,
    });

    res.cookie(AUTH_COOKIE_NAME, result.token, cookieOptions);
    sendSuccess(res, result, 201, undefined, 'Account and organization registered successfully');
  }

  static async login(req: Request, res: Response): Promise<void> {
    const result = await AuthService.login(req.body);

    res.cookie(AUTH_COOKIE_NAME, result.token, cookieOptions);
    sendSuccess(res, result, 200, undefined, 'Logged in successfully');
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    sendSuccess(res, { message: 'Logged out successfully' }, 200);
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    const result = await AuthService.getMe(req.user!.id, req.organizationId);
    sendSuccess(res, result);
  }
}
