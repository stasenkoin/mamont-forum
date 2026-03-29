import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DiscussionLikesModule } from './discussion-likes/discussion-likes.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DiscussionsModule,
    CommentsModule,
    NotificationsModule,
    DiscussionLikesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
