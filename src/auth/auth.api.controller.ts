/*
 * API-контроллер аутентификации.
 * Обрабатывает HTTP-запросы для регистрации, входа, выхода,
 * получения данных текущего пользователя и удаления аккаунта.
 * Все маршруты начинаются с /api/auth.
 * Для авторизации используются сессионные cookie.
 */

// Импортируем декораторы и классы из NestJS
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
  HttpCode,
} from '@nestjs/common';
// Импортируем декораторы Swagger для документации API
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
// Импортируем тип Request из Express
import { Request } from 'express';
// Импортируем сервис аутентификации
import { AuthService } from './auth.service';
// Импортируем DTO для регистрации
import { RegisterDto } from './dto/register.dto';
// Импортируем DTO для входа
import { LoginDto } from './dto/login.dto';
// Импортируем DTO для ответов (для документации Swagger)
import {
  AuthResponseDto,
  UserResponseDto,
  MessageResponseDto,
} from './dto/user-response.dto';
// Импортируем guard для защиты API-эндпоинтов
import { AuthGuardApi } from '../common/auth-api.guard';

// Декоратор @ApiTags группирует эндпоинты в Swagger под заголовком "Авторизация"
@ApiTags('Авторизация')
// Декоратор @Controller задаёт базовый путь для всех маршрутов в этом контроллере
@Controller('api/auth')
export class AuthApiController {
  // Конструктор: внедряем сервис аутентификации через DI
  constructor(private authService: AuthService) {}

  // === Регистрация нового пользователя ===
  @Post('register') // POST /api/auth/register
  @ApiOperation({ summary: 'Регистрация нового пользователя' }) // Описание для Swagger
  @ApiResponse({
    status: 201,
    description: 'Пользователь создан',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 409, description: 'Никнейм уже занят' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    // Проверяем, не занят ли уже этот никнейм
    if (await this.authService.nicknameExists(dto.nickname)) {
      // Если занят — выбрасываем ошибку 409 Conflict
      throw new ConflictException('Этот никнейм уже занят');
    }
    // Регистрируем пользователя (создаём запись в базе данных)
    const user = await this.authService.register(dto);
    // Сохраняем данные пользователя в сессию (автоматический вход после регистрации)
    req.session.userId = user.id;
    req.session.nickname = user.nickname;
    req.session.avatarUrl = user.avatarUrl;
    // Возвращаем ID и никнейм нового пользователя
    return { id: user.id, nickname: user.nickname };
  }

  // === Вход в аккаунт ===
  @Post('login') // POST /api/auth/login
  @HttpCode(200) // Устанавливаем код ответа 200 вместо стандартного 201 для POST
  @ApiOperation({ summary: 'Вход в аккаунт' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Неверный никнейм или пароль' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    // Проверяем никнейм и пароль
    const user = await this.authService.validateUser(
      dto.nickname,
      dto.password,
    );
    // Если пользователь не найден или пароль неверный — ошибка 401
    if (!user) {
      throw new UnauthorizedException('Неверный никнейм или пароль');
    }
    // Сохраняем данные пользователя в сессию
    req.session.userId = user.id;
    req.session.nickname = user.nickname;
    req.session.avatarUrl = user.avatarUrl;
    // Возвращаем ID и никнейм пользователя
    return { id: user.id, nickname: user.nickname };
  }

  // === Выход из аккаунта ===
  @Post('logout') // POST /api/auth/logout
  @HttpCode(200) // Код ответа 200
  @ApiOperation({ summary: 'Выход из аккаунта' })
  @ApiResponse({
    status: 200,
    description: 'Выход выполнен',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @UseGuards(AuthGuardApi) // Только для авторизованных пользователей
  logout(@Req() req: Request) {
    // Уничтожаем сессию (оборачиваем callback в Promise)
    return new Promise<{ message: string }>((resolve) => {
      req.session.destroy(() => {
        // После уничтожения сессии возвращаем сообщение об успехе
        resolve({ message: 'Выход выполнен' });
      });
    });
  }

  // === Получение данных текущего пользователя ===
  @Get('me') // GET /api/auth/me
  @ApiOperation({ summary: 'Получить данные текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @UseGuards(AuthGuardApi) // Только для авторизованных пользователей
  async me(@Req() req: Request) {
    // Ищем пользователя по ID из сессии
    const user = await this.authService.findById(req.session.userId);
    // Если пользователь не найден в базе — ошибка 401
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    // Возвращаем основные данные пользователя (без пароля)
    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }

  // === Удаление своего аккаунта ===
  @Delete('me') // DELETE /api/auth/me
  @ApiOperation({ summary: 'Удалить свой аккаунт' })
  @ApiResponse({
    status: 200,
    description: 'Аккаунт удалён',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @UseGuards(AuthGuardApi) // Только для авторизованных пользователей
  async deleteAccount(@Req() req: Request) {
    // Получаем ID пользователя из сессии
    const userId = req.session.userId;
    // Удаляем аккаунт из базы данных
    await this.authService.deleteAccount(userId);
    // Уничтожаем сессию после удаления аккаунта
    return new Promise<{ message: string }>((resolve) => {
      req.session.destroy(() => {
        resolve({ message: 'Аккаунт удалён' });
      });
    });
  }
}
