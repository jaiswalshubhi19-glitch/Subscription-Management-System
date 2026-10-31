import { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../utils/app-error.js';

export interface CreateNotificationParams {
  organizationId: string;
  userId?: string;
  type?: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export class NotificationService {
  static async create(params: CreateNotificationParams, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    try {
      return await client.notification.create({
        data: {
          organizationId: params.organizationId,
          userId: params.userId,
          type: params.type || 'SYSTEM',
          title: params.title,
          message: params.message,
          link: params.link,
        },
      });
    } catch (error) {
      logger.error('Failed to create notification', error);
      return null;
    }
  }

  static async list(organizationId: string, userId?: string) {
    return prisma.notification.findMany({
      where: {
        organizationId,
        OR: [{ userId: null }, { userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async markAsRead(id: string, organizationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, organizationId },
    });

    if (!notification) {
      throw AppError.notFound('Notification not found');
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(organizationId: string, userId?: string) {
    return prisma.notification.updateMany({
      where: {
        organizationId,
        OR: [{ userId: null }, { userId }],
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}
