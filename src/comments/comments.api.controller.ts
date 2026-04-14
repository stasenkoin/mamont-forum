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
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { MessageResponseDto } from '../auth/dto/user-response.dto';
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
  @ApiResponse({
    status: 200,
    description: 'Список комментариев',
    type: [CommentResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Некорректные параметры пагинации' })
  @ApiResponse({ status: 404, description: 'Обсуждение не найдено' })
  async findAll(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res() res: Response,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('page и limit должны быть больше 0');
    }
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
    });
    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }
    const result = await this.commentsService.findByDiscussion(discussionId, page, limit);
    setPaginationHeaders(
      res,
      `/api/discussions/${discussionId}/comments`,
      page,
      limit,
      result.total,
    );
    res.json(result.items);
  }

  @Get(':commentId')
  @ApiOperation({ summary: 'Получить комментарий по ID' })
  @ApiResponse({
    status: 200,
    description: 'Комментарий найден',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Комментарий не принадлежит обсуждению',
  })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  async findOne(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    const comment = await this.commentsService.findOne(commentId);
    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }
    if (comment.discussionId !== discussionId) {
      throw new BadRequestException('Комментарий не принадлежит обсуждению');
    }
    return comment;
  }

  @Post()
  @ApiOperation({ summary: 'Создать комментарий' })
  @ApiResponse({
    status: 201,
    description: 'Комментарий создан',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Обсуждение не найдено' })
  @UseGuards(AuthGuardApi)
  async create(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
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
      dto.content,
      req.session.userId,
    );

    if (discussion.authorId && discussion.authorId !== req.session.userId) {
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
  @ApiResponse({
    status: 200,
    description: 'Комментарий обновлён',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Некорректные данные или комментарий не принадлежит обсуждению',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав (не автор)' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  @UseGuards(AuthGuardApi)
  async update(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
    @Req() req: Request,
  ) {
    const comment = await this.commentsService.findOne(commentId);
    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }
    if (comment.discussionId !== discussionId) {
      throw new BadRequestException('Комментарий не принадлежит обсуждению');
    }
    if (comment.authorId !== req.session.userId) {
      throw new ForbiddenException('Нет прав (не автор)');
    }
    return this.commentsService.update(commentId, dto.content);
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Удалить комментарий' })
  @ApiResponse({
    status: 200,
    description: 'Комментарий удалён',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Комментарий не принадлежит обсуждению',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав (не автор)' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  @UseGuards(AuthGuardApi)
  async delete(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request,
  ) {
    const comment = await this.commentsService.findOne(commentId);
    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }
    if (comment.discussionId !== discussionId) {
      throw new BadRequestException('Комментарий не принадлежит обсуждению');
    }
    if (comment.authorId !== req.session.userId) {
      throw new ForbiddenException('Нет прав (не автор)');
    }
    await this.commentsService.delete(commentId);
    return { message: 'Комментарий удалён' };
  }
}
