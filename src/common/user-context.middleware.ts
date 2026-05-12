// ─── ЧТО ДЕЛАЕТ ЭТОТ ФАЙЛ ───────────────────────────────────────────────────
// Middleware который запускается на КАЖДОМ запросе к приложению.
// Его задача — прочитать сессию SuperTokens, найти пользователя в нашей БД
// и положить его данные в res.locals.user.
//
// res.locals — это объект который живёт в рамках одного запроса и доступен
// во всех Handlebars-шаблонах автоматически. Именно благодаря этому
// в header.hbs работает {{#if user}} — шаблон видит пользователя.
//
// Отличие от Guard: guard БЛОКИРУЕТ запрос если нет токена.
// Этот middleware НИКОГДА не блокирует — он просто пробует найти пользователя.
// Если токена нет — user просто не кладётся в res.locals, шаблон покажет кнопки входа.
// ────────────────────────────────────────────────────────────────────────────

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Session from 'supertokens-node/recipe/session';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  // Инжектируем PrismaService чтобы ходить в БД за данными пользователя
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Пробуем получить сессию из cookie sAccessToken.
      // sessionRequired: false — ключевое отличие от Guard!
      // Если токена нет — не бросает исключение, просто возвращает null.
      const session = await Session.getSession(req, res, {
        sessionRequired: false,
      });

      if (session) {
        // Токен есть и валидный — получаем supertokensId из JWT
        const supertokensId = session.getUserId();

        // Идём в нашу БД и ищем пользователя по supertokensId.
        // Берём только нужные для шаблонов поля чтобы не тащить лишнее.
        const user = await this.prisma.user.findUnique({
          where: { supertokensId },
          select: { id: true, nickname: true, avatarUrl: true, role: true },
        });

        if (user) {
          // Кладём пользователя в res.locals.user.
          // res.locals автоматически передаётся во все Handlebars-шаблоны.
          // Именно поэтому в header.hbs доступно {{user.nickname}}, {{user.role}} и т.д.
          res.locals.user = user;
        }
      }
    } catch (err) {
      // Если что-то пошло не так — просто логируем и идём дальше.
      // Middleware НЕ должен ломать запрос из-за проблем с сессией.
      console.log('[UserContext] session error:', (err as Error).message);
    }

    // next() — передаёт управление следующему middleware или контроллеру.
    // Без него запрос зависнет и никогда не получит ответ.
    next();
  }
}
