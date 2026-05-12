// ─── ЧТО ДЕЛАЕТ ЭТОТ ФАЙЛ ───────────────────────────────────────────────────
// Guard для MVC-контроллеров (страницы которые рендерят HTML).
// Проверяет авторизован ли пользователь. Если нет — редиректит на /auth/login.
// Используется на контроллерах которые отдают HTML:
// AccountController, DiscussionsController (создание/редактирование обсуждения).
// ────────────────────────────────────────────────────────────────────────────

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import Session from 'supertokens-node/recipe/session';
import { Error as STError } from 'supertokens-node';
import { IS_PUBLIC } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  // Reflector — утилита NestJS для чтения метаданных маршрута.
  // Через него проверяем был ли повешен декоратор @Public() на этот маршрут.
  constructor(private reflector: Reflector) {}

  // canActivate вызывается NestJS автоматически перед каждым маршрутом
  // где стоит @UseGuards(AuthGuard). Возвращает true (пустить) или false (заблокировать).
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Читаем метаданные маршрута — есть ли декоратор @Public()?
    // getAllAndOverride проверяет сначала метод контроллера, потом весь класс.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(), // метод контроллера (например show())
      context.getClass(), // класс контроллера (например DiscussionsController)
    ]);

    // Если маршрут помечен @Public() — сразу пускаем, проверка не нужна
    if (isPublic) return true;

    // Получаем объекты запроса и ответа из контекста текущего HTTP-запроса
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    try {
      // Просим SuperTokens проверить токен из cookie sAccessToken.
      // sessionRequired: true — если токена нет или он истёк, бросает исключение.
      // Если токен валидный — SuperTokens кладёт объект сессии в req.session.
      // После этого в контроллере можно вызывать req.session.getUserId().
      req.session = await Session.getSession(req, res, {
        sessionRequired: true,
      });
      return true; // токен валидный — пускаем запрос в контроллер
    } catch (err) {
      if (STError.isErrorFromSuperTokens(err)) {
        // Ошибка пришла от SuperTokens — значит пользователь не авторизован.
        // Для HTML-страниц делаем редирект на страницу входа.
        res.redirect('/auth/login');
        return false;
      }
      throw err; // неизвестная ошибка — пробрасываем дальше
    }
  }
}
