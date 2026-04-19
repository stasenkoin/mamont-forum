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
import { AuthService } from '../../auth/auth.service';
import { AuthGuardApi } from '../../common/auth-api.guard';
import { CommentsService } from '../../comments/comments.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationArgs } from '../args/pagination.args';
import { CreateCommentInput, UpdateCommentInput } from '../inputs/comment.inputs';
import { buildPage } from '../page.utils';
import { CommentPageType } from '../types/page.types';
import { CommentType } from '../types/comment.type';
import { MessageType } from '../types/message.type';
import { UserType } from '../types/user.type';

type GraphqlContext = {
  req: Request;
  res: Response;
};

@Resolver(() => CommentType)
export class CommentsResolver {
  constructor(
    private commentsService: CommentsService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Query(() => CommentPageType, {
    description: 'Получить страницу комментариев для выбранного обсуждения',
  })
  async commentsByDiscussion(
    @Args('discussionId', { type: () => Int }) discussionId: number,
    @Args() pagination: PaginationArgs,
  ) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { id: true },
    });

    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }

    const result = await this.commentsService.findByDiscussion(
      discussionId,
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

  @Query(() => CommentType, {
    nullable: true,
    description: 'Получить комментарий по его идентификатору',
  })
  async comment(@Args('id', { type: () => Int }) id: number) {
    const comment = await this.commentsService.findOne(id);

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    return comment;
  }

  @Mutation(() => CommentType, {
    description: 'Создать комментарий в обсуждении',
  })
  @UseGuards(AuthGuardApi)
  async createComment(
    @Args('discussionId', { type: () => Int }) discussionId: number,
    @Args('input') input: CreateCommentInput,
    @Context() context: GraphqlContext,
  ) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { id: true, authorId: true },
    });

    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }

    const comment = await this.commentsService.create(
      discussionId,
      input.content,
      context.req.session.userId,
    );

    if (
      discussion.authorId &&
      discussion.authorId !== context.req.session.userId
    ) {
      await this.notificationsService.create({
        type: 'discussion_commented',
        message: `${context.req.session.nickname} оставил комментарий в вашем обсуждении`,
        userId: discussion.authorId,
        discussionId,
      });
    }

    return comment;
  }

  @Mutation(() => CommentType, {
    description: 'Обновить текст собственного комментария',
  })
  @UseGuards(AuthGuardApi)
  async updateComment(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCommentInput,
    @Context() context: GraphqlContext,
  ) {
    const comment = await this.commentsService.findOne(id);

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    if (comment.authorId !== context.req.session.userId) {
      throw new ForbiddenException('Нет прав (не автор)');
    }

    return this.commentsService.update(id, input.content);
  }

  @Mutation(() => MessageType, {
    description: 'Удалить собственный комментарий',
  })
  @UseGuards(AuthGuardApi)
  async deleteComment(
    @Args('id', { type: () => Int }) id: number,
    @Context() context: GraphqlContext,
  ) {
    const comment = await this.commentsService.findOne(id);

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    if (comment.authorId !== context.req.session.userId) {
      throw new ForbiddenException('Нет прав (не автор)');
    }

    await this.commentsService.delete(id);

    return { message: 'Комментарий удалён' };
  }

  @ResolveField(() => UserType, {
    nullable: true,
    description: 'Автор комментария',
  })
  async author(@Parent() comment: CommentType & { author?: UserType | null }) {
    if (comment.author !== undefined) {
      return comment.author;
    }

    if (!comment.authorId) {
      return null;
    }

    return this.authService.findById(comment.authorId);
  }
}
