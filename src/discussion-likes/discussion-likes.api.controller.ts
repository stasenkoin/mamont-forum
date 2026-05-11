import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { DiscussionLikesService } from './discussion-likes.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthService } from '../auth/auth.service';
import { LikeResponseDto } from './dto/like-response.dto';
import { MessageResponseDto } from '../auth/dto/user-response.dto';
import { AuthGuardApi } from '../common/auth-api.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Лайки')
@Controller('api/discussions/:discussionId')
@UseGuards(AuthGuardApi)
@ApiCookieAuth('sAccessToken')export class DiscussionLikesApiController {
  constructor(
    private likesService: DiscussionLikesService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('like')
  @ApiOperation({ summary: 'Поставить лайк обсуждению' })
  @ApiResponse({
    status: 201,
    description: 'Лайк поставлен',
    type: LikeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Обсуждение не найдено' })
  @ApiResponse({ status: 409, description: 'Лайк уже поставлен' })
  async like(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Req() req: Request,
  ) {
    const stId = req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { id: true, authorId: true },
    });
    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }
    const like = await this.likesService.like(user.id, discussionId);

    if (discussion.authorId && discussion.authorId !== user.id) {
      await this.notificationsService.create({
        type: 'discussion_liked',
        message: `${user.nickname} поставил лайк вашему обсуждению`,
        userId: discussion.authorId,
        discussionId,
      });
    }

    return like;
  }

  @Delete('like')
  @ApiOperation({ summary: 'Убрать лайк с обсуждения' })
  @ApiResponse({
    status: 200,
    description: 'Лайк убран',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Обсуждение или лайк не найдены' })
  async unlike(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Req() req: Request,
  ) {
    const stId = req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
    });
    if (!discussion) {
      throw new NotFoundException('Обсуждение не найдено');
    }
    await this.likesService.unlike(user.id, discussionId);
    return { message: 'Лайк убран' };
  }
}
