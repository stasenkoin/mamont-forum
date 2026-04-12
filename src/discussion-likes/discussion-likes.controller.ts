import { ApiExcludeController } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';

@ApiExcludeController()
@Controller('discussions/:discussionId')
export class DiscussionLikesController {}
