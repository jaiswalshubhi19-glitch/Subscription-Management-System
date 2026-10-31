import { Request, Response } from 'express';
import { OrgService } from './org.service.js';
import { sendSuccess } from '../../utils/response.js';

export class OrgController {
  static async getOrganization(req: Request, res: Response): Promise<void> {
    const org = await OrgService.getOrganization(req.organizationId!);
    sendSuccess(res, org);
  }

  static async updateOrganization(req: Request, res: Response): Promise<void> {
    const updated = await OrgService.updateOrganization(
      req.organizationId!,
      req.body,
      req.user?.id
    );
    sendSuccess(res, updated, 200, undefined, 'Organization updated successfully');
  }

  static async listTeam(req: Request, res: Response): Promise<void> {
    const members = await OrgService.listTeamMembers(req.organizationId!);
    sendSuccess(res, members);
  }

  static async inviteMember(req: Request, res: Response): Promise<void> {
    const member = await OrgService.inviteMember(
      req.organizationId!,
      req.body,
      req.user?.id
    );
    sendSuccess(res, member, 201, undefined, 'Team member invited successfully');
  }

  static async updateMemberRole(req: Request, res: Response): Promise<void> {
    const member = await OrgService.updateMemberRole(
      req.organizationId!,
      req.params.memberId,
      req.body.role,
      req.user?.id
    );
    sendSuccess(res, member, 200, undefined, 'Team member role updated successfully');
  }
}
