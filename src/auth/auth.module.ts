import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AccountController } from './account.controller';
import { AuthApiController } from './auth.api.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController, AccountController, AuthApiController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
