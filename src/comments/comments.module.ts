import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsApiController } from './comments.api.controller';
import { CommentsService } from './comments.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [NotificationsModule, AuthModule],
  controllers: [CommentsController, CommentsApiController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
