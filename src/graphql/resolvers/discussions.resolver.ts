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
import { DiscussionsService } from '../../discussions/discussions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationArgs } from '../args/pagination.args';
import {
  CreateDiscussionInput,
  UpdateDiscussionInput,
} from '../inputs/discussion.inputs';
import { buildPage } from '../page.utils';
import { CommentType } from '../types/comment.type';
import { DiscussionType } from '../types/discussion.type';
import { MessageType } from '../types/message.type';
import { DiscussionPageType } from '../types/page.types';
import { UserType } from '../types/user.type';

type GraphqlContext = {
  req: Request;
  res: Response;
};

@Resolver(() => DiscussionType)
export class DiscussionsResolver {
  constructor(
    private discussionsService: DiscussionsService,
    private commentsService: CommentsService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Query(() => DiscussionPageType, {
    description: 'Получить страницу списка обсуждений',
  })
  async discussions(@Args() pagination: PaginationArgs) {
    const result = await this.discussionsService.findAllPaginated(
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

  @Query(() => DiscussionType, {
    nullable: true,
    description: 'Получить обсуждение по идентификатору',
  })
  async discussion(@Args('id', { type: () => Int }) id: number) {
    const discussion = await this.discussionsService.findById(id);

    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }

    return discussion;
  }

  @Mutation(() => DiscussionType, {
    description: 'Создать новое обсуждение',
  })
  @UseGuards(AuthGuardApi)
  async createDiscussion(
    @Args('input') input: CreateDiscussionInput,
    @Context() context: GraphqlContext,
  ) {
    return this.discussionsService.create(input, context.req.session.userId!);
  }

  @Mutation(() => DiscussionType, {
    description: 'Обновить собственное обсуждение',
  })
  @UseGuards(AuthGuardApi)
  async updateDiscussion(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateDiscussionInput,
    @Context() context: GraphqlContext,
  ) {
    const discussion = await this.discussionsService.findById(id);

    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }

    if (discussion.authorId !== context.req.session.userId) {
      throw new ForbiddenException('Нет прав (не автор)');
    }

    return this.discussionsService.update(id, input);
  }

  @Mutation(() => MessageType, {
    description: 'Удалить собственное обсуждение',
  })
  @UseGuards(AuthGuardApi)
  async deleteDiscussion(
    @Args('id', { type: () => Int }) id: number,
    @Context() context: GraphqlContext,
  ) {
    const discussion = await this.discussionsService.findById(id);

    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }

    if (discussion.authorId !== context.req.session.userId) {
      throw new ForbiddenException('Нет прав (не автор)');
    }

    await this.discussionsService.delete(id);

    return { message: 'Обсуждение удалено' };
  }

  @ResolveField(() => UserType, {
    nullable: true,
    description: 'Автор обсуждения',
  })
  async author(
    @Parent() discussion: DiscussionType & { author?: UserType | null },
  ) {
    if (discussion.author !== undefined) {
      return discussion.author;
    }

    if (!discussion.authorId) {
      return null;
    }

    return this.authService.findById(discussion.authorId);
  }

  @ResolveField(() => [CommentType], {
    description: 'Комментарии обсуждения с поддержкой пагинации по аргументам',
  })
  async comments(
    @Parent() discussion: DiscussionType,
    @Args() pagination: PaginationArgs,
  ) {
    const result = await this.commentsService.findByDiscussion(
      discussion.id,
      pagination.page,
      pagination.limit,
    );

    return result.items;
  }

  @ResolveField(() => Int, {
    description: 'Количество комментариев в обсуждении',
  })
  async commentsCount(
    @Parent() discussion: DiscussionType & { _count?: { comments?: number } },
  ) {
    if (discussion._count?.comments !== undefined) {
      return discussion._count.comments;
    }

    return this.prisma.comment.count({
      where: { discussionId: discussion.id },
    });
  }

  @ResolveField(() => Int, {
    description: 'Количество лайков у обсуждения',
  })
  async likesCount(
    @Parent() discussion: DiscussionType & { _count?: { likes?: number } },
  ) {
    if (discussion._count?.likes !== undefined) {
      return discussion._count.likes;
    }

    return this.prisma.discussionLike.count({
      where: { discussionId: discussion.id },
    });
  }
}
