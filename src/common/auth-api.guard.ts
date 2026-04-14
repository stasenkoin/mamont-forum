/*
 * Guard (охранник) для API-эндпоинтов.
 * Проверяет, авторизован ли пользователь, по наличию userId в сессии.
 * Если пользователь не авторизован, выбрасывает ошибку 401 (Unauthorized).
 * Этот guard используется для защиты API-маршрутов, где нужен доступ
 * только для залогиненных пользователей.
 */

// Импортируем необходимые классы и декораторы из NestJS
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// Импортируем тип Request из Express
import { Request } from 'express';

// Декоратор @Injectable позволяет NestJS управлять этим классом через DI (внедрение зависимостей)
@Injectable()
export class AuthGuardApi implements CanActivate {
  // Метод canActivate вызывается перед каждым запросом к защищённому маршруту
  canActivate(context: ExecutionContext): boolean {
    // Получаем объект HTTP-запроса с типизацией Express
    const request = context.switchToHttp().getRequest<Request>();
    // Проверяем, есть ли userId в сессии (то есть залогинен ли пользователь)
    if (!request.session?.userId) {
      // Если нет — выбрасываем ошибку 401 с сообщением
      throw new UnauthorizedException('Необходима авторизация');
    }
    // Если пользователь авторизован — разрешаем доступ
    return true;
  }
}
