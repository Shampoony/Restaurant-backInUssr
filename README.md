# Снова в СССР — сайт ресторана

Vue 3 + TypeScript + Vite на фронте, Express + TypeScript на бэке.
Дизайн, шрифты и палитра полностью перенесены из первой (статичной) версии сайта,
которая сохранена в папке `legacy/` для сверки.

## Запуск

```bash
npm install
npm run dev
```

- сайт — http://localhost:5173
- API — http://localhost:3001/api
- админка — http://localhost:5173/admin (логин `admin`, пароль `sssr1959`)

Логин, пароль и порт меняются в `.env` (шаблон — `.env.example`).

Остальные команды:

```bash
npm run build      # сборка фронтенда в dist/ (с проверкой типов)
npm run typecheck  # только проверка типов
npm run start:api  # только API, без Vite
```

## Структура

```
shared/types.ts        общие типы фронтенда и API — единственный источник правды
server/
  src/index.ts         точка входа Express
  src/routes/          эндпоинты: menu, reviews, reservations, contacts, auth
  src/db.ts            хранилище (JSON-файл) — сюда придёт настоящая БД
  src/auth.ts          заглушка авторизации: сессии в памяти
  src/validation.ts    валидация форм, ошибки возвращаются по полям
  data/menu.seed.json  12 разделов и 69 блюд, вынутых из старого menu.html
src/
  api/                 весь HTTP-обмен: client.ts + описание эндпоинтов
  stores/              pinia: язык, авторизация, контакты, уведомления
  composables/         useAsyncData, useMediaQuery, useBodyLock
  directives/          v-reveal, v-tilt, v-parallax — анимации
  components/          ui/, layout/, home/, menu/, reviews/, booking/
  views/               страницы сайта и админки
  locales/             словари RU/EN (ключи проверяются типами)
  styles/              токены, база, каркас, слой анимаций, стили админки
```

## API

Публичное:

| Метод | Путь                 | Назначение                          |
| ----- | -------------------- | ----------------------------------- |
| GET   | `/api/menu`          | разделы меню с блюдами              |
| GET   | `/api/menu/featured` | подборка блюд для главной           |
| GET   | `/api/reviews`       | одобренные отзывы                   |
| POST  | `/api/reviews`       | отзыв от гостя → на модерацию       |
| POST  | `/api/reservations`  | бронь столика                       |
| GET   | `/api/contacts`      | адрес, телефон, часы работы         |
| POST  | `/api/auth/login`    | вход в админку                      |

Админское (нужен заголовок `Authorization: Bearer <token>`):
`GET/PATCH /api/admin/menu`, `GET/PATCH/DELETE /api/admin/reviews`,
`GET/PATCH /api/admin/reservations`, `PUT /api/admin/contacts`.

## Что уже готово к настоящему бэкенду

- фронтенд ходит только через `src/api` — при переезде на другой сервер меняется один модуль;
- данные лежат в `server/data/db.json` через класс `JsonDatabase` — при подключении
  PostgreSQL/MongoDB переписывается только `server/src/db.ts`;
- авторизация вынесена в `server/src/auth.ts`: сейчас сессии в памяти, интерфейс
  (`login` / `logout` / `requireAdmin`) под настоящий JWT не изменится;
- бронирование столика уже отправляется в API и складывается в базу — осталось
  добавить подтверждение и экран броней в админке (эндпоинты для него уже есть).

## Анимации

- `v-reveal` — появление блока при прокрутке (варианты `:left`, `:right`, `:scale`, `:mask`, задержка для каскада);
- `AnimatedText` — заголовок выезжает по словам из-под маски;
- `CountUp` — цифры фактов отсчитываются, когда попадают на экран;
- `v-tilt` — объёмный наклон карточек и фотографий за курсором;
- `v-parallax` — водяной знак «1959» едет медленнее страницы;
- ховеры: заливка кнопок слева направо, подчёркивание навигации, подъём карточек блюд,
  оживающие заглушки фотографий, вращение иконок соцсетей;
- переходы между страницами, каруселью отзывов и разделами меню;
- всё отключается при системной настройке «уменьшить движение» (`prefers-reduced-motion`).
