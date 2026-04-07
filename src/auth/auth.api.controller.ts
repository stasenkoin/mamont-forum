import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  UseGuards,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuardApi } from '../common/auth-api.guard';

@Controller('api/auth')
export class AuthApiController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    if (await this.authService.nicknameExists(dto.nickname)) {
      throw new ConflictException('Этот никнейм уже занят');
    }
    const user = await this.authService.register(dto);
    req.session.userId = user.id;
    req.session.nickname = user.nickname;
    req.session.avatarUrl = user.avatarUrl;
    return { id: user.id, nickname: user.nickname };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(
      dto.nickname,
      dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Неверный никнейм или пароль');
    }
    req.session.userId = user.id;
    req.session.nickname = user.nickname;
    req.session.avatarUrl = user.avatarUrl;
    return { id: user.id, nickname: user.nickname };
  }

  @Post('logout')
  @UseGuards(AuthGuardApi)
  logout(@Req() req: Request) {
    return new Promise<{ message: string }>((resolve) => {
      req.session.destroy(() => {
        resolve({ message: 'Выход выполнен' });
      });
    });
  }

  @Get('me')
  @UseGuards(AuthGuardApi)
  async me(@Req() req: Request) {
    const user = await this.authService.findById(req.session.userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }

  @Delete('me')
  @UseGuards(AuthGuardApi)
  async deleteAccount(@Req() req: Request) {
    const userId = req.session.userId;
    await this.authService.deleteAccount(userId);
    return new Promise<{ message: string }>((resolve) => {
      req.session.destroy(() => {
        resolve({ message: 'Аккаунт удалён' });
      });
    });
  }
}
