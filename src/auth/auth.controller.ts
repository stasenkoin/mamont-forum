import { ApiExcludeController } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Req,
  Render,
} from '@nestjs/common';
import { Request } from 'express';

@ApiExcludeController()
@Controller('auth')
export class AuthController {
  @Get('register')
  @Render('auth/register')
  registerForm(@Req() req: Request) {
    return { user: req.session.userId ? req.session : null };
  }

  @Get('login')
  @Render('auth/login')
  loginForm(@Req() req: Request) {
    return { user: req.session.userId ? req.session : null };
  }
}
