import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsApiController } from './comments.api.controller';
import { CommentsService } from './comments.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [CommentsController, CommentsApiController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
