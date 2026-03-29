import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  Render,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../common/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('register')
  @Render('auth/register')
  registerForm(@Req() req: Request) {
    return { user: req.session.userId ? req.session : null };
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (await this.authService.nicknameExists(dto.nickname)) {
      return res.render('auth/register', {
        error: 'Этот никнейм уже занят',
        user: null,
      });
    }
    const user = await this.authService.register(dto);
    req.session.userId = user.id;
    req.session.nickname = user.nickname;
    req.session.avatarUrl = user.avatarUrl;
    res.redirect('/discussions');
  }

  @Get('login')
  @Render('auth/login')
  loginForm(@Req() req: Request) {
    return { user: req.session.userId ? req.session : null };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = await this.authService.validateUser(dto.nickname, dto.password);
    if (!user) {
      return res.render('auth/login', {
        error: 'Неверный никнейм или пароль',
        user: null,
      });
    }
    req.session.userId = user.id;
    req.session.nickname = user.nickname;
    req.session.avatarUrl = user.avatarUrl;
    res.redirect('/discussions');
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(() => {
      res.redirect('/discussions');
    });
  }
}
