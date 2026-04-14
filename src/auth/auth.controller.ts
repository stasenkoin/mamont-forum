/*
 * MVC-контроллер для страниц аутентификации.
 * Отвечает за отображение HTML-страниц регистрации и входа.
 * Не содержит бизнес-логики — просто рендерит (отрисовывает) шаблоны Handlebars.
 * Маршруты: GET /auth/register и GET /auth/login.
 */

// Импортируем декоратор для скрытия контроллера из Swagger-документации
import { ApiExcludeController } from '@nestjs/swagger';
// Импортируем декораторы NestJS для работы с маршрутами
import {
  Controller,
  Get,
  Req,
  Render,
} from '@nestjs/common';
// Импортируем тип Request из Express
import { Request } from 'express';

// Скрываем этот контроллер из Swagger (он не является частью API)
@ApiExcludeController()
// Базовый путь для всех маршрутов — /auth
@Controller('auth')
export class AuthController {
  // GET /auth/register — страница регистрации
  @Get('register')
  @Render('auth/register') // Рендерим шаблон views/auth/register.hbs
  registerForm(@Req() req: Request) {
    // Передаём данные пользователя в шаблон (null, если не залогинен)
    return { user: req.session.userId ? req.session : null };
  }

  // GET /auth/login — страница входа
  @Get('login')
  @Render('auth/login') // Рендерим шаблон views/auth/login.hbs
  loginForm(@Req() req: Request) {
    // Передаём данные пользователя в шаблон (null, если не залогинен)
    return { user: req.session.userId ? req.session : null };
  }
}
