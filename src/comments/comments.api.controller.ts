import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthGuardApi } from '../common/auth-api.guard';
import { setPaginationHeaders } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Комментарии')
@Controller('api/discussions/:discussionId/comments')
export class CommentsApiController {
  constructor(
    private commentsService: CommentsService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Получить комментарии обсуждения' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res() res: Response,
  ) {
    const result = await this.commentsService.findByDiscussion(discussionId, page, limit);
    setPaginationHeaders(res, `/api/discussions/${discussionId}/comments`, page, limit, result.total);
    res.json(result.items);
  }

  @Get(':commentId')
  @ApiOperation({ summary: 'Получить комментарий по ID' })
  async findOne(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    if (!(await this.commentsService.belongsToDiscussion(commentId, discussionId))) {
      throw new BadRequestException();
    }
    const comment = await this.commentsService.findOne(commentId);
    if (!comment) throw new NotFoundException();
    return comment;
  }

  @Post()
  @ApiOperation({ summary: 'Создать комментарий' })
  @UseGuards(AuthGuardApi)
  async create(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const comment = await this.commentsService.create(
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

    return comment;
  }

  @Patch(':commentId')
  @ApiOperation({ summary: 'Обновить комментарий' })
  @UseGuards(AuthGuardApi)
  async update(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
    @Req() req: Request,
  ) {
    if (
      !(await this.commentsService.belongsToDiscussion(commentId, discussionId))
    ) {
      throw new BadRequestException();
    }
    if (!(await this.commentsService.isAuthor(commentId, req.session.userId))) {
      throw new ForbiddenException();
    }
    return this.commentsService.update(commentId, dto.content);
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Удалить комментарий' })
  @UseGuards(AuthGuardApi)
  async delete(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request,
  ) {
    if (
      !(await this.commentsService.belongsToDiscussion(commentId, discussionId))
    ) {
      throw new BadRequestException();
    }
    if (!(await this.commentsService.isAuthor(commentId, req.session.userId))) {
      throw new ForbiddenException();
    }
    await this.commentsService.delete(commentId);
    return { message: 'Комментарий удалён' };
  }
}
