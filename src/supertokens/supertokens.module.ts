// ─── ЧТО ДЕЛАЕТ ЭТОТ ФАЙЛ ───────────────────────────────────────────────────
// Это ДИНАМИЧЕСКИЙ МОДУЛЬ — ключевое требование лабы.
//
// Обычный модуль просто импортируется: imports: [SupertokensModule]
// Динамический — принимает конфигурацию в момент регистрации:
//   imports: [SupertokensModule.forRoot({...})]
//
// Зачем это нужно: конфиг (ключи, домены) берётся из process.env в app.module.ts
// и передаётся сюда. Модуль регистрирует конфиг как провайдер, NestJS создаёт
// SupertokensService, тот получает конфиг в конструкторе и вызывает supertokens.init()
// ────────────────────────────────────────────────────────────────────────────

import { DynamicModule, Module } from '@nestjs/common';
import { SupertokensService } from './supertokens.service';
import { SUPERTOKENS_CONFIG, SupertokensConfig } from './supertokens.config';

@Module({}) // пустой декоратор — всё настраивается динамически в forRoot()
export class SupertokensModule {
  // Статический метод — вызывается в app.module.ts при импорте модуля.
  // Принимает конфиг и возвращает объект DynamicModule с нужными провайдерами.
  static forRoot(config: SupertokensConfig): DynamicModule {
    return {
      module: SupertokensModule,

      // global: true — модуль виден во всём приложении без дополнительных импортов.
      // SupertokensService будет доступен в любом другом модуле автоматически.
      global: true,

      providers: [
        // Регистрируем конфиг как провайдер с ключом SUPERTOKENS_CONFIG.
        // useValue: config — просто подставляем объект как есть, без создания класса.
        // Именно этот провайдер получает SupertokensService через @Inject(SUPERTOKENS_CONFIG)
        { provide: SUPERTOKENS_CONFIG, useValue: config },

        // Регистрируем сервис — NestJS создаст его экземпляр и вызовет конструктор.
        // В конструкторе SupertokensService и происходит supertokens.init()
        SupertokensService,
      ],

      exports: [SupertokensService], // делаем сервис доступным для других модулей
    };
  }
}
