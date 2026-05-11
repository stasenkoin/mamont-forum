import { ApiExcludeController } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Req,
  Sse,
  Render,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../common/auth.guard';

@ApiExcludeController()
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private authService: AuthService,
  ) {}

  @Get()
  @Render('notifications/index')
  async list(@Req() req: Request) {
    const stId = req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    return { user };
  }

  @Get('unread-count')
  async unreadCount(@Req() req: Request) {
    const stId = req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    const count = await this.notificationsService.countUnread(user.id);
    return { count };
  }

  @Sse('stream')
  async stream(@Req() req: Request): Promise<Observable<{ data: string }>> {
    const stId = req.session.getUserId();
    const user = await this.authService.findBySupertokensId(stId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return this.notificationsService.getStreamForUser(user.id);
  }
}
