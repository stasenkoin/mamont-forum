import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersApiController } from './users.api.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, UsersApiController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
