import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsApiController } from './notifications.api.controller';
import { NotificationsService } from './notifications.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController, NotificationsApiController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
