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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserResponseDto, MessageResponseDto } from './dto/user-response.dto';
import { AuthGuardApi } from '../common/auth-api.guard';

@ApiTags('Авторизация')
@Controller('api/auth')
export class AuthApiController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 409, description: 'Никнейм уже занят' })
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
  @ApiOperation({ summary: 'Вход в аккаунт' })
  @ApiResponse({ status: 201, description: 'Успешный вход', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Неверный никнейм или пароль' })
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
  @ApiOperation({ summary: 'Выход из аккаунта' })
  @ApiResponse({ status: 201, description: 'Выход выполнен', type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @UseGuards(AuthGuardApi)
  logout(@Req() req: Request) {
    return new Promise<{ message: string }>((resolve) => {
      req.session.destroy(() => {
        resolve({ message: 'Выход выполнен' });
      });
    });
  }

  @Get('me')
  @ApiOperation({ summary: 'Получить данные текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Данные пользователя', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
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
  @ApiOperation({ summary: 'Удалить свой аккаунт' })
  @ApiResponse({ status: 200, description: 'Аккаунт удалён', type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
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
