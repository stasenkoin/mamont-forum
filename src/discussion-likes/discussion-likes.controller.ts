import {
  Controller,
  Post,
  Param,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DiscussionLikesService } from './discussion-likes.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthGuard } from '../common/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('discussions/:discussionId')
@UseGuards(AuthGuard)
export class DiscussionLikesController {
  constructor(
    private likesService: DiscussionLikesService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  @Post('like')
  async like(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.likesService.like(req.session.userId, discussionId);

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

    res.redirect(`/discussions/${discussionId}`);
  }

  @Post('unlike')
  async unlike(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.likesService.unlike(req.session.userId, discussionId);
    res.redirect(`/discussions/${discussionId}`);
  }
}
