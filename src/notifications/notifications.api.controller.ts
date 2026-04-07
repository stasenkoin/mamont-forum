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
import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
import { AuthGuardApi } from '../common/auth-api.guard';
import { setPaginationHeaders } from '../common/pagination';

@Controller('api/notifications')
@UseGuards(AuthGuardApi)
export class NotificationsApiController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const all = await this.notificationsService.findAllForUser(req.session.userId);
    const total = all.length;
    const start = (page - 1) * limit;
    setPaginationHeaders(res, '/api/notifications', page, limit, total);
    res.json(all.slice(start, start + limit));
  }

  @Post(':id/read')
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
  async markAllAsRead(@Req() req: Request) {
    await this.notificationsService.markAllAsRead(req.session.userId);
    return { message: 'Все уведомления прочитаны' };
  }

  @Delete(':id')
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
