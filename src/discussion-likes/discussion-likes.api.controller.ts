import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { DiscussionLikesService } from './discussion-likes.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthGuardApi } from '../common/auth-api.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Лайки')
@Controller('api/discussions/:discussionId')
@UseGuards(AuthGuardApi)
export class DiscussionLikesApiController {
  constructor(
    private likesService: DiscussionLikesService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  @Post('like')
  @ApiOperation({ summary: 'Поставить лайк обсуждению' })
  async like(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Req() req: Request,
  ) {
    const like = await this.likesService.like(req.session.userId, discussionId);

    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { authorId: true },
    });
    if (discussion?.authorId && discussion.authorId !== req.session.userId) {
      await this.notificationsService.create({
        type: 'discussion_liked',
        message: `${req.session.nickname} поставил лайк вашему обсуждению`,
        userId: discussion.authorId,
        discussionId,
      });
    }

    return like;
  }

  @Delete('like')
  @ApiOperation({ summary: 'Убрать лайк с обсуждения' })
  async unlike(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Req() req: Request,
  ) {
    await this.likesService.unlike(req.session.userId, discussionId);
    return { message: 'Лайк убран' };
  }
}
