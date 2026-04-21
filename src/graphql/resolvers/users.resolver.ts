import { Parent, Query, ResolveField, Resolver, Args } from '@nestjs/graphql';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { PaginationArgs } from '../args/pagination.args';
import { buildPage } from '../page.utils';
import { UserPageType } from '../types/page.types';
import { UserType } from '../types/user.type';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  @Query(() => UserPageType, {
    description: 'Получить страницу списка пользователей',
  })
  async users(@Args() pagination: PaginationArgs) {
    const result = await this.usersService.findAllPaginated(
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

  @ResolveField(() => Number, {
    name: 'discussionsCount',
    description: 'Количество обсуждений пользователя',
  })
  async discussionsCount(
    @Parent() user: UserType & { _count?: { discussions?: number } },
  ) {
    if (user._count?.discussions !== undefined) {
      return user._count.discussions;
    }

    return this.prisma.discussion.count({
      where: { authorId: user.id },
    });
  }

  @ResolveField(() => Number, {
    name: 'commentsCount',
    description: 'Количество комментариев пользователя',
  })
  async commentsCount(
    @Parent() user: UserType & { _count?: { comments?: number } },
  ) {
    if (user._count?.comments !== undefined) {
      return user._count.comments;
    }

    return this.prisma.comment.count({
      where: { authorId: user.id },
    });
  }
}
