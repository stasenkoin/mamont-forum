/*
 * Вспомогательная функция для пагинации (постраничной навигации).
 * Устанавливает HTTP-заголовки Link (по стандарту HATEOAS) и X-Total-Count
 * в ответе сервера. Это позволяет клиенту (фронтенду) знать, сколько
 * всего записей есть и как переходить между страницами.
 */

// Импортируем тип Response из Express для работы с HTTP-ответом
import { Response } from 'express';

/**
 * Функция устанавливает заголовки пагинации в HTTP-ответ.
 * @param res — объект ответа Express
 * @param baseUrl — базовый URL для ссылок (например, '/api/discussions')
 * @param page — текущая страница
 * @param limit — количество записей на одной странице
 * @param total — общее количество записей в базе данных
 */
export function setPaginationHeaders(
  res: Response,
  baseUrl: string,
  page: number,
  limit: number,
  total: number,
) {
  // Вычисляем общее количество страниц (минимум 1)
  const totalPages = Math.ceil(total / limit) || 1;
  // Массив для хранения ссылок на страницы
  const links: string[] = [];

  // Если текущая страница не первая, добавляем ссылку на предыдущую страницу
  if (page > 1) {
    links.push(`<${baseUrl}?page=${page - 1}&limit=${limit}>; rel="prev"`);
  }
  // Если текущая страница не последняя, добавляем ссылку на следующую страницу
  if (page < totalPages) {
    links.push(`<${baseUrl}?page=${page + 1}&limit=${limit}>; rel="next"`);
  }
  // Всегда добавляем ссылку на первую страницу
  links.push(`<${baseUrl}?page=1&limit=${limit}>; rel="first"`);
  // Всегда добавляем ссылку на последнюю страницу
  links.push(`<${baseUrl}?page=${totalPages}&limit=${limit}>; rel="last"`);

  // Если есть ссылки, устанавливаем заголовок Link
  if (links.length) {
    res.setHeader('Link', links.join(', '));
  }
  // Устанавливаем заголовок X-Total-Count с общим количеством записей
  res.setHeader('X-Total-Count', total.toString());
  // Разрешаем клиенту читать заголовки X-Total-Count и Link (нужно для CORS)
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, Link');
}
