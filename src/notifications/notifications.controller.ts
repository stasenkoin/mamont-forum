import { ApiExcludeController } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Req,
  Sse,
  Render,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../common/auth.guard';

@ApiExcludeController()
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @Render('notifications/index')
  list(@Req() req: Request) {
    return { user: req.session };
  }

  @Get('unread-count')
  async unreadCount(@Req() req: Request) {
    const count = await this.notificationsService.countUnread(
      req.session.userId,
    );
    return { count };
  }

  @Sse('stream')
  stream(@Req() req: Request): Observable<{ data: string }> {
    return this.notificationsService.getStreamForUser(req.session.userId);
  }
}
