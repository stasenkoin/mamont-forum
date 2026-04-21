import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { DiscussionLikesService } from '../../discussion-likes/discussion-likes.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
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
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { id: true, authorId: true },
    });

    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }

    const like = await this.likesService.like(
      context.req.session.userId!,
      discussionId,
    );

    if (
      discussion.authorId &&
      discussion.authorId !== context.req.session.userId
    ) {
      await this.notificationsService.create({
        type: 'discussion_liked',
        message: `${context.req.session.nickname} поставил лайк вашему обсуждению`,
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
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { id: true },
    });

    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }

    await this.likesService.unlike(context.req.session.userId!, discussionId);

    return { message: 'Лайк убран' };
  }
}
