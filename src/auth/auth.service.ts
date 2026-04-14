/*
 * Сервис аутентификации (авторизации).
 * Содержит бизнес-логику для регистрации, входа, поиска пользователя,
 * проверки никнейма и удаления аккаунта.
 * Пароли хешируются с помощью библиотеки bcrypt для безопасного хранения.
 */

// Импортируем декоратор Injectable для внедрения зависимостей
import { Injectable } from '@nestjs/common';
// Импортируем сервис Prisma для работы с базой данных
import { PrismaService } from '../prisma/prisma.service';
// Импортируем библиотеку bcrypt для хеширования паролей
import * as bcrypt from 'bcrypt';
// Импортируем DTO (Data Transfer Object) для регистрации
import { RegisterDto } from './dto/register.dto';

// Декоратор @Injectable позволяет NestJS внедрять этот сервис в другие классы
@Injectable()
export class AuthService {
  // Конструктор: Prisma-сервис внедряется автоматически через DI
  constructor(private prisma: PrismaService) {}

  // Метод регистрации нового пользователя
  async register(dto: RegisterDto) {
    // Хешируем пароль с солью (10 раундов) для безопасного хранения
    const hash = await bcrypt.hash(dto.password, 10);
    // Создаём нового пользователя в базе данных
    return this.prisma.user.create({
      data: {
        nickname: dto.nickname, // Никнейм пользователя
        password: hash, // Сохраняем хеш пароля, а не сам пароль
        avatarUrl: dto.avatarUrl || null, // URL аватара (необязательное поле)
      },
    });
  }

  // Метод проверки учётных данных при входе (логине)
  async validateUser(nickname: string, password: string) {
    // Ищем пользователя по никнейму в базе данных
    const user = await this.prisma.user.findUnique({ where: { nickname } });
    // Если пользователь не найден — возвращаем null
    if (!user) return null;
    // Сравниваем введённый пароль с хешем из базы данных
    const valid = await bcrypt.compare(password, user.password);
    // Если пароль верный — возвращаем пользователя, иначе null
    return valid ? user : null;
  }

  // Метод поиска пользователя по его ID
  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // Метод проверки, существует ли пользователь с таким никнеймом
  async nicknameExists(nickname: string) {
    // Ищем пользователя по никнейму
    const user = await this.prisma.user.findUnique({ where: { nickname } });
    // Возвращаем true, если пользователь найден, и false, если нет
    return !!user;
  }

  // Метод удаления аккаунта пользователя по его ID
  async deleteAccount(userId: number) {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
