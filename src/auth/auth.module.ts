import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AccountController } from './account.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController, AccountController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
