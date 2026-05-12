// ─── ЧТО ДЕЛАЕТ ЭТОТ ФАЙЛ ───────────────────────────────────────────────────
// Расширяет встроенный TypeScript-тип объекта Request из Express.
// По умолчанию Express не знает что в req существует поле session —
// это поле добавляет SuperTokens в runtime. Без этого файла TypeScript
// выдавал бы ошибку на каждой строке где мы пишем req.session.getUserId().
// Этот файл говорит TypeScript: "доверяй нам, поле session существует".
// ────────────────────────────────────────────────────────────────────────────

import { SessionContainer } from 'supertokens-node/recipe/session';

// declare global — расширяем глобальные типы TypeScript
declare global {
  // namespace Express — залезаем внутрь типов Express
  namespace Express {
    // Расширяем интерфейс Request — добавляем поле session.
    // Теперь TypeScript знает что у любого объекта Request есть поле session
    // типа SessionContainer (это класс из SDK SuperTokens).
    // SessionContainer даёт методы: getUserId(), revokeSession() и др.
    interface Request {
      session: SessionContainer;
    }
  }
}
