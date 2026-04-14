import { Module } from '@nestjs/common';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsApiController } from './discussions.api.controller';
import { DiscussionsService } from './discussions.service';

@Module({
  controllers: [DiscussionsController, DiscussionsApiController],
  providers: [DiscussionsService],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
