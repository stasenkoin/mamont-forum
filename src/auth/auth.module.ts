import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AccountController } from './account.controller';
import { AuthApiController } from './auth.api.controller';
import { AuthService } from './auth.service';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [AuthController, AccountController, AuthApiController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
