import { ApiExcludeController } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  Req,
  Render,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { CommentsService } from './comments.service';
import { AuthGuard } from '../common/auth.guard';

@ApiExcludeController()
@Controller('discussions/:discussionId/comments')
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(':commentId/edit')
  @Render('comments/edit')
  async editForm(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request,
  ) {
    const comment = await this.commentsService.findOne(commentId);
    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    const belongsToDiscussion = await this.commentsService.belongsToDiscussion(
      commentId,
      discussionId,
    );
    if (!belongsToDiscussion) {
      throw new BadRequestException(
        'Комментарий не принадлежит этому обсуждению',
      );
    }

    const isAuthor = await this.commentsService.isAuthor(
      commentId,
      req.session.userId,
    );
    if (!isAuthor) {
      throw new ForbiddenException(
        'Вы не можете редактировать чужой комментарий',
      );
    }

    return {
      discussionId,
      commentId,
      user: req.session,
    };
  }
}
