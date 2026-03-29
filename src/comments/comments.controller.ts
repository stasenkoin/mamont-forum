import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Res,
  Render,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CommentsService } from './comments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '../common/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('discussions/:discussionId/comments')
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  async create(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.commentsService.create(
      discussionId,
      dto.content,
      req.session.userId,
    );

    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { authorId: true },
    });
    if (discussion?.authorId && discussion.authorId !== req.session.userId) {
      await this.notificationsService.create({
        type: 'discussion_commented',
        message: `${req.session.nickname} оставил комментарий в вашем обсуждении`,
        userId: discussion.authorId,
        discussionId,
      });
    }

    res.redirect(`/discussions/${discussionId}#comments`);
  }

  @Get(':commentId/edit')
  async editForm(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (
      !(await this.commentsService.belongsToDiscussion(
        commentId,
        discussionId,
      ))
    ) {
      throw new BadRequestException();
    }
    if (!(await this.commentsService.isAuthor(commentId, req.session.userId))) {
      throw new ForbiddenException();
    }
    const comment = await this.commentsService.findOne(commentId);
    if (!comment) throw new NotFoundException();
    res.render('comments/edit', {
      comment,
      discussionId,
      user: req.session,
    });
  }

  @Post(':commentId/update')
  async update(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (
      !(await this.commentsService.belongsToDiscussion(
        commentId,
        discussionId,
      ))
    ) {
      throw new BadRequestException();
    }
    if (!(await this.commentsService.isAuthor(commentId, req.session.userId))) {
      throw new ForbiddenException();
    }
    await this.commentsService.update(commentId, dto.content);
    res.redirect(`/discussions/${discussionId}`);
  }

  @Post(':commentId/delete')
  async delete(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (
      !(await this.commentsService.belongsToDiscussion(
        commentId,
        discussionId,
      ))
    ) {
      throw new BadRequestException();
    }
    if (!(await this.commentsService.isAuthor(commentId, req.session.userId))) {
      throw new ForbiddenException();
    }
    await this.commentsService.delete(commentId);
    res.redirect(`/discussions/${discussionId}`);
  }
}
