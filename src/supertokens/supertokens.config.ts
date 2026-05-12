// ─── ЧТО ДЕЛАЕТ ЭТОТ ФАЙЛ ───────────────────────────────────────────────────
// Описывает ФОРМУ конфигурации SuperTokens — какие данные нужны чтобы
// подключиться к их серверу. Сам по себе этот файл ничего не делает,
// это просто TypeScript-типы + константа-ключ для инъекции зависимостей.
// ────────────────────────────────────────────────────────────────────────────

// Уникальный строковый ключ. Используется как идентификатор при инъекции
// зависимостей — когда SupertokensService захочет получить конфиг,
// он попросит его именно по этому ключу через @Inject(SUPERTOKENS_CONFIG)
export const SUPERTOKENS_CONFIG = 'SUPERTOKENS_CONFIG';

// Описание объекта конфигурации — TypeScript проверит что все поля переданы
export interface SupertokensConfig {
  connectionUri: string; // URL сервера SuperTokens (их облако на AWS)
  apiKey: string; // секретный ключ для авторизации запросов к серверу SuperTokens
  appName: string; // название приложения (отображается в письмах от SuperTokens)
  apiDomain: string; // домен нашего бэкенда (https://botfarm-blog.onrender.com)
  websiteDomain: string; // домен фронтенда (у нас совпадает с apiDomain т.к. SSR)
}
