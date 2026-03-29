import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface CreateNotificationData {
  type: string;
  message: string;
  userId: number;
  discussionId?: number;
}

@Injectable()
export class NotificationsService {
  private notificationSubject = new Subject<{
    userId: number;
    notification: any;
  }>();

  constructor(private prisma: PrismaService) {}

  async create(data: CreateNotificationData) {
    const notification = await this.prisma.notification.create({
      data: {
        type: data.type,
        message: data.message,
        userId: data.userId,
        discussionId: data.discussionId || null,
      },
    });
    this.notificationSubject.next({
      userId: data.userId,
      notification,
    });
    return notification;
  }

  async findAllForUser(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countUnread(userId: number) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: number) {
    return this.prisma.notification.delete({ where: { id } });
  }

  async isOwner(notificationId: number, userId: number): Promise<boolean> {
    const n = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });
    return n?.userId === userId;
  }

  getStreamForUser(userId: number) {
    return this.notificationSubject.pipe(
      filter((event) => event.userId === userId),
      map((event) => ({
        data: JSON.stringify(event.notification),
      })),
    );
  }
}
