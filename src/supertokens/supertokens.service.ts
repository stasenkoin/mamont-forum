// ─── ЧТО ДЕЛАЕТ ЭТОТ ФАЙЛ ───────────────────────────────────────────────────
// Это сердце подключения к SuperTokens. Инициализирует SuperTokens ОДИН РАЗ
// при старте приложения. Без вызова supertokens.init() здесь — вся авторизация
// не работает вообще: нет эндпоинтов /auth/signin, нет проверки токенов, ничего.
// ────────────────────────────────────────────────────────────────────────────

import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import UserRoles from 'supertokens-node/recipe/userroles';
import { SUPERTOKENS_CONFIG, SupertokensConfig } from './supertokens.config';

@Injectable()
export class SupertokensService {
  // @Inject(SUPERTOKENS_CONFIG) — NestJS найдёт провайдер зарегистрированный
  // под ключом SUPERTOKENS_CONFIG в supertokens.module.ts и подставит его сюда.
  // Это и есть смысл динамического модуля — конфиг приходит снаружи через forRoot()
  constructor(@Inject(SUPERTOKENS_CONFIG) private config: SupertokensConfig) {
    supertokens.init({
      framework: 'express', // говорим SuperTokens что работаем на Express (NestJS под капотом использует Express)

      supertokens: {
        connectionURI: config.connectionUri, // куда стучаться — облачный сервер SuperTokens на AWS
        apiKey: config.apiKey, // ключ чтобы сервер SuperTokens принял наш запрос
      },

      appInfo: {
        appName: config.appName,
        apiDomain: config.apiDomain, // наш домен — SuperTokens будет выставлять cookie именно для него
        websiteDomain: config.websiteDomain,
        apiBasePath: '/auth', // все эндпоинты SuperTokens монтируются под /auth:
        //   POST /auth/signin          — вход
        //   POST /auth/signup          — регистрация
        //   POST /auth/signout         — выход
        //   POST /auth/session/refresh — обновление accessToken через refreshToken
        websiteBasePath: '/login', // путь к странице логина на фронтенде (используется в письмах)
      },

      recipeList: [
        // Рецепт входа по email + пароль.
        // Автоматически создаёт эндпоинты signin/signup/reset-password
        // и хранит пользователей с хэшированными паролями на стороне SuperTokens
        EmailPassword.init(),

        // Рецепт ролей.
        // Позволяет назначать роли (USER, ADMIN) и проверять их.
        // Роли хранятся в SuperTokens и вшиваются в JWT-токен в поле st-role
        UserRoles.init(),

        Session.init({
          // 'lax' — cookie отправляется при обычных переходах по ссылкам,
          // но не при cross-site запросах (защита от CSRF атак).
          // Альтернативы: 'strict' (ещё строже) и 'none' (для разных доменов фронта/бэка)
          cookieSameSite: 'lax',
        }),
      ],
    });
  }
}
