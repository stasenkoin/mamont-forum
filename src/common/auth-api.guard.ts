// ─── ЧТО ДЕЛАЕТ ЭТОТ ФАЙЛ ───────────────────────────────────────────────────
// Guard для API-контроллеров (эндпоинты которые возвращают JSON).
// Проверяет авторизован ли пользователь. Если нет — бросает 401 Unauthorized.
// Используется на всех /api/* эндпоинтах которые требуют авторизации:
// /api/auth/me, /api/discussions (POST/PATCH/DELETE), /api/notifications и др.
//
// Отличие от AuthGuard: тот редиректит на страницу входа (для браузера),
// этот возвращает JSON с ошибкой (для API-клиентов — Postman, фронтенд JS).
// ────────────────────────────────────────────────────────────────────────────

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import Session from 'supertokens-node/recipe/session';
import { Error as STError } from 'supertokens-node';
import { IS_PUBLIC } from './public.decorator';

@Injectable()
export class AuthGuardApi implements CanActivate {
  // Reflector — утилита NestJS для чтения метаданных маршрута.
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Читаем метаданные — есть ли @Public() на этом маршруте?
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Если маршрут публичный — пропускаем без проверки токена
    if (isPublic) return true;

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    try {
      // Просим SuperTokens проверить токен из cookie sAccessToken.
      // Если токен валидный — сессия кладётся в req.session.
      // Если нет — бросает исключение которое ловим ниже.
      req.session = await Session.getSession(req, res, {
        sessionRequired: true,
      });
      // ↑ вот здесь — SuperTokens читает cookie, проверяет токен
      // и кладёт объект сессии в req.session
      // после этого req.session.getUserId() уже работает
      return true; // токен валидный — пускаем запрос в контроллер
    } catch (err) {
      if (STError.isErrorFromSuperTokens(err)) {
        // Для API возвращаем HTTP 401 с JSON телом { message: 'Необходима авторизация' }
        // а не редирект — клиент (браузерный JS или Postman) сам решит что делать
        throw new UnauthorizedException('Необходима авторизация');
      }
      throw err;
    }
  }
}
