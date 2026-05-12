// ─── ЧТО ДЕЛАЕТ ЭТОТ ФАЙЛ ───────────────────────────────────────────────────
// Guard для проверки РОЛИ пользователя.
// Используется ПОСЛЕ AuthGuardApi — сначала проверяем что пользователь
// авторизован, потом проверяем что у него нужная роль.
// Пример: @UseGuards(AuthGuardApi, RolesGuard) + @Roles('ADMIN')
// Используется на эндпоинтах только для администратора:
// POST /api/rules, DELETE /api/rules/:id
// ────────────────────────────────────────────────────────────────────────────

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import UserRoles from 'supertokens-node/recipe/userroles';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Читаем метаданные маршрута — какие роли указаны в @Roles()?
    // Например @Roles('ADMIN') положит сюда ['ADMIN']
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Если декоратор @Roles() не указан — маршрут не требует конкретной роли,
    // пускаем всех авторизованных пользователей
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request>();

    // req.session уже заполнен предыдущим guard-ом AuthGuardApi.
    // Если по какой-то причине сессии нет — блокируем
    const session = req.session;
    if (!session) return false;

    // Получаем userId из сессии — это supertokensId пользователя
    const userId = session.getUserId();

    // Обращаемся к SuperTokens API чтобы получить роли этого пользователя.
    // 'public' — это название tenant (арендатор/пространство), у нас один — public.
    // Роли хранятся в SuperTokens, а не в нашей БД.
    const rolesResponse = await UserRoles.getRolesForUser('public', userId);
    const userRoles = rolesResponse.roles; // например ['USER', 'ADMIN']

    // Проверяем: есть ли хотя бы одна из requiredRoles в ролях пользователя?
    // .some() вернёт true если хотя бы одно совпадение найдено.
    // Например: requiredRoles = ['ADMIN'], userRoles = ['USER', 'ADMIN'] → true
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
