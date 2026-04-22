import { ApiExcludeController } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Render,
} from '@nestjs/common';

@ApiExcludeController()
@Controller('auth')
export class AuthController {
  @Get('register')
  @Render('auth/register')
  registerForm() {
    return {};
  }

  @Get('login')
  @Render('auth/login')
  loginForm() {
    return {};
  }
}
