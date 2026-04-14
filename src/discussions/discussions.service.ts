/*
 * Сервис для работы с обсуждениями (discussions).
 * Содержит бизнес-логику: получение списка обсуждений (с пагинацией и без),
 * получение одного обсуждения по ID (с комментариями и пагинацией),
 * создание, обновление, удаление обсуждения и проверка авторства.
 */

// Импортируем декоратор Injectable для внедрения зависимостей
import { Injectable } from '@nestjs/common';
// Импортируем сервис Prisma для работы с базой данных
import { PrismaService } from '../prisma/prisma.service';
// Импортируем DTO для создания обсуждения
import { CreateDiscussionDto } from './dto/create-discussion.dto';
// Импортируем DTO для обновления обсуждения
import { UpdateDiscussionDto } from './dto/update-discussion.dto';

// Декоратор @Injectable позволяет NestJS внедрять этот сервис в другие классы
@Injectable()
export class DiscussionsService {
  // Конструктор: Prisma-сервис внедряется автоматически через DI
  constructor(private prisma: PrismaService) {}

  // Получить все обсуждения (без пагинации)
  async findAll() {
    return this.prisma.discussion.findMany({
      include: {
        author: true, // Подгружаем данные автора
        _count: { select: { comments: true, likes: true } }, // Считаем количество комментариев и лайков
      },
      orderBy: { createdAt: 'desc' }, // Сортируем по дате создания (новые сверху)
    });
  }

  // Получить обсуждения с пагинацией (постранично)
  async findAllPaginated(page: number, limit: number) {
    // Вычисляем, сколько записей пропустить (offset)
    const skip = (page - 1) * limit;
    // Выполняем два запроса параллельно: получаем записи и общее количество
    const [items, total] = await Promise.all([
      this.prisma.discussion.findMany({
        include: {
          author: true, // Подгружаем данные автора
          _count: { select: { comments: true, likes: true } }, // Считаем комментарии и лайки
        },
        orderBy: { createdAt: 'desc' }, // Сортируем по дате (новые сверху)
        skip, // Пропускаем записи предыдущих страниц
        take: limit, // Берём только нужное количество записей
      }),
      this.prisma.discussion.count(), // Считаем общее количество обсуждений
    ]);
    // Возвращаем записи, общее количество, текущую страницу и лимит
    return { items, total, page, limit };
  }

  // Получить одно обсуждение по ID с комментариями (с пагинацией комментариев)
  async findOne(id: number, commentsPage = 1, commentsLimit = 5) {
    // Вычисляем offset для комментариев
    const skip = (commentsPage - 1) * commentsLimit;
    return this.prisma.discussion.findUnique({
      where: { id }, // Ищем по ID
      include: {
        author: true, // Подгружаем данные автора обсуждения
        comments: {
          include: { author: true }, // Подгружаем авторов комментариев
          orderBy: { createdAt: 'asc' }, // Комментарии по порядку (старые сверху)
          skip, // Пропускаем комментарии предыдущих страниц
          take: commentsLimit, // Берём нужное количество комментариев
        },
        likes: true, // Подгружаем лайки
        _count: { select: { comments: true, likes: true } }, // Считаем комментарии и лайки
      },
    });
  }

  // Создать новое обсуждение
  async create(dto: CreateDiscussionDto, authorId: number) {
    return this.prisma.discussion.create({
      data: {
        title: dto.title, // Заголовок обсуждения
        content: dto.content, // Текст обсуждения
        authorId, // ID автора (текущего пользователя)
      },
    });
  }

  // Обновить существующее обсуждение
  async update(id: number, dto: UpdateDiscussionDto) {
    return this.prisma.discussion.update({
      where: { id }, // Находим по ID
      data: { title: dto.title, content: dto.content }, // Обновляем заголовок и текст
    });
  }

  // Удалить обсуждение по ID
  async delete(id: number) {
    return this.prisma.discussion.delete({ where: { id } });
  }

  // Проверить, является ли пользователь автором обсуждения
  async isAuthor(discussionId: number, userId: number): Promise<boolean> {
    // Получаем только поле authorId для экономии ресурсов
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { authorId: true },
    });
    // Сравниваем authorId обсуждения с переданным userId
    return discussion?.authorId === userId;
  }
}
