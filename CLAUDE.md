# FC Sever — Official Website

Сайт футбольного клуба «Север» из Калуги. Next.js 14 (SSG) + Express-сервер с SQLite.

## Правила работы

- **Всегда коммитить после правок** — после завершения изменений сразу делать git commit, не дожидаясь просьбы. Пуш — только по запросу.
- **Не деплоить БД** — файл `db-northen.sqlite` живёт только на проде и не должен перезаписываться при деплое.
- **Обновлять документацию** — после значимых изменений обновлять CLAUDE.md, TODO.md и CHANGELOG.md, используя скилл `doc-coauthoring` для структурированной работы с документацией.

## Быстрый старт

```bash
nvm use          # Node v12 (.nvmrc)
npm install      # использует legacy-peer-deps (см. .npmrc)
npm run dev      # dev-сервер Next.js (порт 3000)
npm run build    # статическая сборка → /out/
```

Express-сервер (API + HTTPS):
```bash
cd express-server && node server.js   # порт 443, нужны SSL-сертификаты
```

## Стек

- **Фреймворк:** Next.js 14.0.3, React 18.2, output: 'export' (SSG)
- **UI:** Material-UI 6 (@mui/material, @mui/icons-material), Emotion
- **Слайдеры:** Swiper 11, react-slick
- **Данные:** DatoCMS (GraphQL), SQLite (express-server/db/), парсинг КФЛ (node-html-parser)
- **HTTP:** axios, react-query 3
- **Анимации:** framer-motion 12
- **Изображения:** next/image (unoptimized: true), sharp
- **Бэкенд:** Express.js, HTTPS (Let's Encrypt), multer для загрузки файлов

## Структура проекта

```
src/
├── pages/           # Роутинг Next.js (index, news, stats, players/[slug], games/[slug])
├── screens/         # Контейнерные компоненты страниц (Players.jsx, News.jsx, ...)
├── components/      # Переиспользуемые компоненты (LogoSvg, layout)
├── core/ui/         # Базовый UI-слой (Layout, Theme, Slider)
├── hooks/           # Кастомные хуки (.ts)
├── utils/           # Утилиты (datacms.js — GraphQL запросы, fetchData.js)
├── config/          # Конфигурация
├── data/            # Статические данные
├── styles/          # Глобальные стили (CSS, SASS)
├── templates/       # Шаблонные компоненты
└── breakpoints.ts   # Брейкпоинты: S_0, S_600, S_900, S_1200, S_1536
express-server/      # Бэкенд: API /c/news, /c/players, /c/addNews
command/             # Скрипты деплоя
deploy.js            # SSH-деплой на сервер
```

## Код-конвенции

- **Язык файлов:** основная масса — `.js/.jsx`, часть файлов (хуки, брейкпоинты) — `.ts/.tsx`
- **Форматирование:** Prettier — trailing-comma: es5, без точек с запятой, одинарные кавычки
  ```bash
  npm run format
  ```
- **Компоненты:** функциональные (React hooks), без классов
- **Стилизация:** MUI-темы + inline-стили через `sx`/`style`, глобальный CSS в `src/styles/`
- **Адаптив:** `useMediaQuery(theme.breakpoints.between(S_0, S_600))` и аналогичные проверки
- **Данные на страницах:** `getStaticProps` + `getStaticPaths` для динамических маршрутов
- **Импорт изображений:** DatoCMS CDN (`www.datocms-assets.com`)

## Источники данных

1. **DatoCMS** — основной контент (новости, игроки, работы). GraphQL-запросы в `src/utils/datacms.js`
2. **SQLite** — локальная БД (`express-server/db/db-northen.sqlite`). Эндпоинты: GET `/c/news`, GET `/c/players`, POST `/c/addNews`
3. **Парсинг КФЛ** — данные об играх с внешнего сайта через `node-html-parser`

## Деплой

### Ручной
```bash
npm run publish    # сборка + деплой через SSH (deploy.js)
```

Деплой загружает содержимое `/out/` на удалённый сервер по SSH. Express-сервер работает отдельно с SSL от Let's Encrypt (`/etc/letsencrypt/live/fc-sever.ru/`).

### CI/CD (GitHub Actions)
При push в `main` автоматически запускается `.github/workflows/deploy.yml`:
1. Устанавливает зависимости (`npm install --legacy-peer-deps`)
2. Собирает статику (`npm run build`)
3. Загружает `/out/` → `/fcsever/out` на сервер
4. Загружает `express-server/` → `/fcsever/express-server` (без `node_modules` и `db-northen.sqlite` — БД не перезаписывается!)
5. Запускает `npm i` на сервере
6. Перезапускает express-server в screen-сессии `server`

Секреты в GitHub: `SSH_PRIVATE_KEY`, `SERVER_HOST`, `DATOCMS_API_TOKEN`. Можно запустить вручную через кнопку "Run workflow".

## Важные детали

- **CI/CD:** GitHub Actions — автодеплой при push в main. Express-сервер перезапускается через screen-сессию `server`.
- **Нет тестов.** Тестовый фреймворк не настроен.
- **Node v12** — проект завязан на старую версию Node (указано в `.nvmrc`).
- **legacy-peer-deps** — обязательно при установке зависимостей.
- **output: 'export'** в `next.config.js` — все страницы генерируются статически, нет SSR.
- **Миграция с Gatsby** — проект изначально был на Gatsby (остались артефакты в `build-gatsby/`, keyword "gatsby" в package.json).
