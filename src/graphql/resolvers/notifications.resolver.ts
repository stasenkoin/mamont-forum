import {
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Request, Response } from 'express';
import { AuthGuardApi } from '../../common/auth-api.guard';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationArgs } from '../args/pagination.args';
import { buildPage } from '../page.utils';
import { DiscussionType } from '../types/discussion.type';
import { MessageType } from '../types/message.type';
import { NotificationPageType } from '../types/page.types';
import { NotificationType } from '../types/notification.type';

type GraphqlContext = {
  req: Request;
  res: Response;
};

@Resolver(() => NotificationType)
export class NotificationsResolver {
  constructor(
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  @Query(() => NotificationPageType, {
    description: 'Получить страницу уведомлений текущего пользователя',
  })
  @UseGuards(AuthGuardApi)
  async myNotifications(
    @Args() pagination: PaginationArgs,
    @Context() context: GraphqlContext,
  ) {
    const result = await this.notificationsService.findForUserPaginated(
      context.req.session.userId,
      pagination.page,
      pagination.limit,
    );

    return buildPage(
      result.items,
      result.total,
      pagination.page,
      pagination.limit,
    );
  }

  @Mutation(() => NotificationType, {
    description: 'Отметить уведомление как прочитанное',
  })
  @UseGuards(AuthGuardApi)
  async markNotificationAsRead(
    @Args('id', { type: () => Int }) id: number,
    @Context() context: GraphqlContext,
  ) {
    const notification = await this.notificationsService.findOne(id);

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    if (notification.userId !== context.req.session.userId) {
      throw new ForbiddenException('Нет прав (чужое уведомление)');
    }

    return this.notificationsService.markAsRead(id);
  }

  @Mutation(() => MessageType, {
    description:
      'Отметить все уведомления текущего пользователя как прочитанные',
  })
  @UseGuards(AuthGuardApi)
  async markAllNotificationsAsRead(@Context() context: GraphqlContext) {
    await this.notificationsService.markAllAsRead(context.req.session.userId);

    return { message: 'Все уведомления прочитаны' };
  }

  @Mutation(() => MessageType, {
    description: 'Удалить уведомление текущего пользователя',
  })
  @UseGuards(AuthGuardApi)
  async deleteNotification(
    @Args('id', { type: () => Int }) id: number,
    @Context() context: GraphqlContext,
  ) {
    const notification = await this.notificationsService.findOne(id);

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    if (notification.userId !== context.req.session.userId) {
      throw new ForbiddenException('Нет прав (чужое уведомление)');
    }

    await this.notificationsService.delete(id);

    return { message: 'Уведомление удалено' };
  }

  @ResolveField(() => DiscussionType, {
    nullable: true,
    description: 'Связанное с уведомлением обсуждение',
  })
  async discussion(
    @Parent()
    notification: NotificationType & {
      discussion?: DiscussionType | null;
    },
  ) {
    if (notification.discussion !== undefined) {
      return notification.discussion;
    }

    if (!notification.discussionId) {
      return null;
    }

    return this.prisma.discussion.findUnique({
      where: { id: notification.discussionId },
      include: {
        author: true,
        _count: { select: { comments: true, likes: true } },
      },
    });
  }
}
