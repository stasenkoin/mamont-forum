/*
 * Главный файл приложения (точка входа).
 * Здесь мы создаём NestJS-приложение, настраиваем шаблонизатор Handlebars,
 * регистрируем частичные шаблоны (partials), подключаем Swagger-документацию,
 * настраиваем сессии пользователя, глобальную валидацию данных (ValidationPipe)
 * и глобальный фильтр ошибок Prisma (PrismaExceptionFilter).
 * После всех настроек запускаем сервер на указанном порту.
 */

// Загружаем переменные окружения из файла .env
import 'dotenv/config';
// Импортируем фабрику для создания NestJS-приложения
import { NestFactory } from '@nestjs/core';
// Импортируем тип приложения на базе Express
import { NestExpressApplication } from '@nestjs/platform-express';
// Импортируем пайп для автоматической валидации входящих данных
import { ValidationPipe } from '@nestjs/common';
// Импортируем инструменты для настройки Swagger (документация API)
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// Импортируем функцию join для работы с путями файловой системы
import { join } from 'path';
// Импортируем функции для синхронного чтения файлов и директорий
import { readFileSync, readdirSync } from 'fs';
// Импортируем шаблонизатор Handlebars
import hbs from 'hbs';
// Импортируем middleware для работы с сессиями
import session from 'express-session';
// Импортируем главный модуль приложения
import { AppModule } from './app.module';
// Импортируем глобальный фильтр ошибок Prisma
import { PrismaExceptionFilter } from './common/prisma-exception.filter';

// Главная асинхронная функция запуска приложения
async function bootstrap() {
  // Создаём экземпляр NestJS-приложения на базе Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Указываем папку для статических файлов (CSS, JS, картинки)
  app.useStaticAssets(join(process.cwd(), 'public'));
  // Указываем папку, где лежат шаблоны страниц (views)
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  // Устанавливаем Handlebars как движок шаблонов
  app.setViewEngine('hbs');

  // Определяем путь к папке с частичными шаблонами (partials)
  const partialsDir = join(process.cwd(), 'views', 'partials');
  // Читаем список файлов в папке partials
  const filenames = readdirSync(partialsDir);
  // Проходим по каждому файлу и регистрируем его как частичный шаблон
  for (const filename of filenames) {
    // Убираем расширение .hbs, чтобы получить имя partial
    const name = filename.replace('.hbs', '');
    // Читаем содержимое файла шаблона
    const content = readFileSync(join(partialsDir, filename), 'utf-8');
    // Регистрируем partial в Handlebars по имени
    hbs.handlebars.registerPartial(name, content);
  }

  // Настраиваем конфигурацию Swagger (документация API)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mamont Forum API') // Заголовок документации
    .setDescription(
      'REST API форума Mamont. Для авторизации: вызовите POST /api/auth/login, cookie установится автоматически.',
    ) // Описание API
    .setVersion('1.0') // Версия API
    .addCookieAuth('connect.sid') // Указываем авторизацию через cookie
    .build(); // Собираем конфигурацию
  // Создаём документ Swagger на основе приложения и конфигурации
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Подключаем Swagger UI по адресу /api/docs
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { withCredentials: true }, // Отправлять cookie при запросах из Swagger UI
  });

  // Подключаем глобальный пайп валидации (проверяет входящие данные по DTO)
  // transform: true — автоматически преобразует типы (например, строку в число)
  // whitelist: true — удаляет поля, которых нет в DTO
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  // Подключаем глобальный фильтр для обработки ошибок Prisma
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Получаем экземпляр Express-приложения для дополнительных настроек
  const expressApp = app.getHttpAdapter().getInstance();
  // Устанавливаем главный layout (обёртку) для всех страниц
  expressApp.set('view options', { layout: 'layouts/main' });

  // Регистрируем хелпер eq — сравнивает два значения (используется в шаблонах)
  hbs.registerHelper('eq', (a, b) => a === b);
  // Регистрируем хелпер truncate — обрезает строку до указанной длины
  hbs.registerHelper('truncate', (str: string, len: number) => {
    if (!str) return ''; // Если строки нет, возвращаем пустую строку
    // Если строка длиннее лимита, обрезаем и добавляем многоточие
    return str.length > len ? str.substring(0, len) + '...' : str;
  });
  // Регистрируем хелпер formatDate — форматирует дату в русском формате
  hbs.registerHelper('formatDate', (date: Date) => {
    if (!date) return ''; // Если даты нет, возвращаем пустую строку
    // Форматируем дату: день, месяц прописью, год, часы и минуты
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  // Подключаем middleware для работы с сессиями (хранение данных пользователя между запросами)
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'mamont-forum-secret', // Секретный ключ для подписи cookie сессии
      resave: false, // Не сохранять сессию, если она не изменилась
      saveUninitialized: false, // Не создавать пустые сессии
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // Время жизни cookie — 1 день (в миллисекундах)
      },
    }),
  );

  // Определяем порт из переменных окружения или используем 3000 по умолчанию
  const port = process.env.PORT || 3000;
  // Запускаем сервер и слушаем входящие запросы на указанном порту
  await app.listen(port);
}
// Вызываем функцию запуска приложения
bootstrap();
