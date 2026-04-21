import { NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { DiscussionLikesService } from '../../discussion-likes/discussion-likes.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../../auth/auth.service';
import { AuthGuardApi } from '../../common/auth-api.guard';
import { DiscussionLikeType } from '../types/discussion-like.type';
import { MessageType } from '../types/message.type';

type GraphqlContext = {
  req: Request;
  res: Response;
};

@Resolver(() => DiscussionLikeType)
export class DiscussionLikesResolver {
  constructor(
    private likesService: DiscussionLikesService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Mutation(() => DiscussionLikeType, {
    description: 'Поставить лайк обсуждению',
  })
  @UseGuards(AuthGuardApi)
  async likeDiscussion(
    @Args('discussionId', { type: () => Int }) discussionId: number,
    @Context() context: GraphqlContext,
  ) {
    const stId = context.req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { id: true, authorId: true },
    });

    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }

    const like = await this.likesService.like(user.id, discussionId);

    if (discussion.authorId && discussion.authorId !== user.id) {
      await this.notificationsService.create({
        type: 'discussion_liked',
        message: `${user.nickname} поставил лайк вашему обсуждению`,
        userId: discussion.authorId,
        discussionId,
      });
    }

    return like;
  }

  @Mutation(() => MessageType, {
    description: 'Убрать лайк со своего обсуждения',
  })
  @UseGuards(AuthGuardApi)
  async unlikeDiscussion(
    @Args('discussionId', { type: () => Int }) discussionId: number,
    @Context() context: GraphqlContext,
  ) {
    const stId = context.req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { id: true },
    });

    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }

    await this.likesService.unlike(user.id, discussionId);

    return { message: 'Лайк убран' };
  }
}
