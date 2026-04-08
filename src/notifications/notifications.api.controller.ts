import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
import { AuthGuardApi } from '../common/auth-api.guard';
import { setPaginationHeaders } from '../common/pagination';

@ApiTags('Уведомления')
@Controller('api/notifications')
@UseGuards(AuthGuardApi)
export class NotificationsApiController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список уведомлений' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const all = await this.notificationsService.findAllForUser(
      req.session.userId,
    );
    const total = all.length;
    const start = (page - 1) * limit;
    setPaginationHeaders(res, '/api/notifications', page, limit, total);
    res.json(all.slice(start, start + limit));
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    if (!(await this.notificationsService.isOwner(id, req.session.userId))) {
      throw new ForbiddenException();
    }
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Отметить все уведомления как прочитанные' })
  async markAllAsRead(@Req() req: Request) {
    await this.notificationsService.markAllAsRead(req.session.userId);
    return { message: 'Все уведомления прочитаны' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить уведомление' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    if (!(await this.notificationsService.isOwner(id, req.session.userId))) {
      throw new ForbiddenException();
    }
    await this.notificationsService.delete(id);
    return { message: 'Уведомление удалено' };
  }
}
