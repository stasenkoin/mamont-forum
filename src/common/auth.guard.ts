/*
 * Guard (охранник) для MVC-страниц (серверный рендеринг).
 * Проверяет, авторизован ли пользователь, по наличию userId в сессии.
 * Если пользователь не залогинен — перенаправляет его на страницу входа (/auth/login).
 * В отличие от AuthGuardApi, этот guard не выбрасывает ошибку,
 * а делает redirect (перенаправление) — это удобнее для обычных веб-страниц.
 */

// Импортируем необходимые классы и декораторы из NestJS
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// Декоратор @Injectable позволяет NestJS управлять этим классом через DI
@Injectable()
export class AuthGuard implements CanActivate {
  // Метод canActivate вызывается перед каждым запросом к защищённому маршруту
  canActivate(context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // Получаем объект HTTP-запроса (без типизации, поэтому есть eslint-disable)
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // Получаем объект HTTP-ответа (без типизации)
    const response = context.switchToHttp().getResponse();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // Проверяем, есть ли userId в сессии (залогинен ли пользователь)
    if (!request.session?.userId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      // Если не залогинен — перенаправляем на страницу входа
      response.redirect('/auth/login');
      // Возвращаем false — запрос не будет обработан контроллером
      return false;
    }
    // Если пользователь авторизован — разрешаем доступ к странице
    return true;
  }
}
