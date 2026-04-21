import {
  Controller,
  Get,
  Post,
  Delete,
  Header,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  DefaultValuePipe,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { MessageResponseDto } from '../auth/dto/user-response.dto';
import { AuthGuardApi } from '../common/auth-api.guard';
import { setPaginationHeaders } from '../common/pagination';

@ApiTags('Уведомления')
@Controller('api/notifications')
@UseGuards(AuthGuardApi)
export class NotificationsApiController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @Header('Cache-Control', 'private, max-age=60')
  @ApiOperation({ summary: 'Получить список уведомлений' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Список уведомлений',
    type: [NotificationResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('page и limit должны быть больше 0');
    }
    const result = await this.notificationsService.findForUserPaginated(
      req.session.userId,
      page,
      limit,
    );
    setPaginationHeaders(res, '/api/notifications', page, limit, result.total);
    res.json(result.items);
  }

  @Post(':id/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
  @ApiResponse({
    status: 200,
    description: 'Уведомление прочитано',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав (чужое уведомление)' })
  @ApiResponse({ status: 404, description: 'Уведомление не найдено' })
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const notification = await this.notificationsService.findOne(id);
    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    if (notification.userId !== req.session.userId) {
      throw new ForbiddenException('Нет прав (чужое уведомление)');
    }
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  @HttpCode(200)
  @ApiOperation({ summary: 'Отметить все уведомления как прочитанные' })
  @ApiResponse({
    status: 200,
    description: 'Все уведомления прочитаны',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async markAllAsRead(@Req() req: Request) {
    await this.notificationsService.markAllAsRead(req.session.userId);
    return { message: 'Все уведомления прочитаны' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить уведомление' })
  @ApiResponse({
    status: 200,
    description: 'Уведомление удалено',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав (чужое уведомление)' })
  @ApiResponse({ status: 404, description: 'Уведомление не найдено' })
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const notification = await this.notificationsService.findOne(id);
    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    if (notification.userId !== req.session.userId) {
      throw new ForbiddenException('Нет прав (чужое уведомление)');
    }
    await this.notificationsService.delete(id);
    return { message: 'Уведомление удалено' };
  }
}
