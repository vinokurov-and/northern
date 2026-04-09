# TODO — Northern (fc-sever.ru)

## Удалить deprecated пакеты
- `@datocms/cma-client-node` — deprecated, заменить источник данных
- `request` — deprecated с 2020, уязвимости. Заменить на `axios` (уже есть) или встроенный `fetch`
- `react-head` — дублирует react-helmet, оба не нужны при наличии `next/head`
- `react-helmet` — заменить на `next/head` (нативный для Next.js)
- `react-masonry-component` — последний релиз 2018, заменить на CSS grid masonry
- `react-slick` + `slick-carousel` — дублируют `swiper`, убрать если можно заменить
- `gh-pages` — не используется (деплой через SSH)

## Обновить пакеты
- `next` 14 → 15 — Turbopack, улучшенный SSG, Server Components
- `react` / `react-dom` 18 → 19 — новые хуки, Server Components
- `dotenv` 8 → 16 (или убрать — Next.js имеет встроенные env)
- `sharp` 0.32 → 0.33 — баги, безопасность
- `prettier` 1.x → 3.x

## Рефакторинг
- Заменить DatoCMS на другой источник данных (SQLite? API?)
- keywords: убрать "gatsby" (артефакт миграции)
- `.nvmrc` указывает Node 12, реально используется 18+ — обновить
