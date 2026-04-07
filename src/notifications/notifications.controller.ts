import { ApiExcludeController } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Res,
  Sse,
  UseGuards,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../common/auth.guard';

@ApiExcludeController()
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async list(@Req() req: Request, @Res() res: Response) {
    const notifications = await this.notificationsService.findAllForUser(
      req.session.userId,
    );
    res.render('notifications/index', {
      notifications,
      user: req.session,
    });
  }

  @Post(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!(await this.notificationsService.isOwner(id, req.session.userId))) {
      throw new ForbiddenException();
    }
    await this.notificationsService.markAsRead(id);
    res.redirect('/notifications');
  }

  @Post('read-all')
  async markAllAsRead(@Req() req: Request, @Res() res: Response) {
    await this.notificationsService.markAllAsRead(req.session.userId);
    res.redirect('/notifications');
  }

  @Post(':id/delete')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!(await this.notificationsService.isOwner(id, req.session.userId))) {
      throw new ForbiddenException();
    }
    await this.notificationsService.delete(id);
    res.redirect('/notifications');
  }

  @Get('unread-count')
  async unreadCount(@Req() req: Request, @Res() res: Response) {
    const count = await this.notificationsService.countUnread(
      req.session.userId,
    );
    res.json({ count });
  }

  @Sse('stream')
  stream(@Req() req: Request): Observable<{ data: string }> {
    return this.notificationsService.getStreamForUser(req.session.userId);
  }
}
