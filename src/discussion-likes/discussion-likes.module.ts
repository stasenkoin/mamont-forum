import { Module } from '@nestjs/common';
import { DiscussionLikesController } from './discussion-likes.controller';
import { DiscussionLikesApiController } from './discussion-likes.api.controller';
import { DiscussionLikesService } from './discussion-likes.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DiscussionLikesController, DiscussionLikesApiController],
  providers: [DiscussionLikesService],
  exports: [DiscussionLikesService],
})
export class DiscussionLikesModule {}
