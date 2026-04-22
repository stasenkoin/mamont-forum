import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { readFileSync, readdirSync } from 'fs';
import hbs from 'hbs';
import supertokens from 'supertokens-node';
import { middleware } from 'supertokens-node/framework/express';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      process.env.APP_URL ?? 'http://localhost:3456',
      'https://sandbox.embed.apollographql.com',
      'https://explorer.embed.apollographql.com',
    ],
    allowedHeaders: ['Content-Type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.use((req, _res, next) => {
    if (req.path.startsWith('/auth/') && !req.headers['st-auth-mode']) {
      req.headers['st-auth-mode'] = 'cookie';
    }
    next();
  });

  app.use(middleware());

  app.useStaticAssets(join(process.cwd(), 'public'));
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('hbs');

  const partialsDir = join(process.cwd(), 'views', 'partials');
  const filenames = readdirSync(partialsDir);
  for (const filename of filenames) {
    const name = filename.replace('.hbs', '');
    const content = readFileSync(join(partialsDir, filename), 'utf-8');
    hbs.handlebars.registerPartial(name, content);
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mamont Forum API')
    .setDescription('REST API форума Mamont.')
    .setVersion('1.0')
    .addCookieAuth('sAccessToken')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { withCredentials: true },
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('view options', { layout: 'layouts/main' });

  hbs.registerHelper('eq', (a, b) => a === b);
  hbs.registerHelper('truncate', (str: string, len: number) => {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  });
  hbs.registerHelper('formatDate', (date: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
