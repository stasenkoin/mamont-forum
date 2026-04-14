/*
 * MVC-контроллер для страницы аккаунта (личного кабинета).
 * Отображает страницу с данными текущего пользователя.
 * Защищён AuthGuard — доступен только авторизованным пользователям.
 * Маршрут: GET /account.
 */

// Импортируем декоратор для скрытия контроллера из Swagger-документации
import { ApiExcludeController } from '@nestjs/swagger';
// Импортируем декораторы NestJS для работы с маршрутами и guard-ами
import { Controller, Get, Req, Render, UseGuards } from '@nestjs/common';
// Импортируем тип Request из Express
import { Request } from 'express';
// Импортируем guard для проверки авторизации на MVC-страницах
import { AuthGuard } from '../common/auth.guard';

// Скрываем этот контроллер из Swagger (он не является частью API)
@ApiExcludeController()
// Базовый путь для всех маршрутов — /account
@Controller('account')
// Применяем guard ко всем маршрутам контроллера — только для залогиненных
@UseGuards(AuthGuard)
export class AccountController {
  // GET /account — страница личного кабинета
  @Get()
  @Render('account/index') // Рендерим шаблон views/account/index.hbs
  account(@Req() req: Request) {
    // Передаём данные сессии пользователя в шаблон
    return { user: req.session };
  }
}
