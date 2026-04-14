/*
 * Глобальный фильтр исключений для ошибок Prisma.
 * Prisma — это ORM (инструмент для работы с базой данных).
 * Когда Prisma выбрасывает ошибку (например, запись не найдена),
 * этот фильтр перехватывает её и превращает в понятный HTTP-ответ:
 *   P2025 (запись не найдена) → 404 Not Found
 *   P2002 (дубликат уникального поля) → 409 Conflict
 *   P2003 (нарушение внешнего ключа) → 400 Bad Request
 *   Остальные ошибки → 500 Internal Server Error
 */

// Импортируем декораторы и классы из NestJS для создания фильтра исключений
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
// Импортируем типы ошибок Prisma
import { Prisma } from '@prisma/client';
// Импортируем тип Response из Express
import { Response } from 'express';

// Декоратор @Catch указывает, какие исключения перехватывает этот фильтр
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  // Метод catch вызывается при каждой перехваченной ошибке
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    // Получаем объект HTTP-ответа из контекста запроса
    const response = host.switchToHttp().getResponse<Response>();

    // Проверяем код ошибки Prisma и отправляем соответствующий HTTP-ответ
    switch (exception.code) {
      // P2025 — запись не найдена в базе данных
      case 'P2025':
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Запись не найдена',
        });
        break;
      // P2002 — нарушение уникального ограничения (например, такой никнейм уже есть)
      case 'P2002':
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'Запись с такими данными уже существует',
        });
        break;
      // P2003 — нарушение ссылочной целостности (внешний ключ указывает на несуществующую запись)
      case 'P2003':
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Нарушение ссылочной целостности',
        });
        break;
      // Все остальные ошибки Prisma — внутренняя ошибка сервера
      default:
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка базы данных',
        });
    }
  }
}
