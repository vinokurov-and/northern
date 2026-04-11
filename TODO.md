# TODO — Northern (fc-sever.ru)

## Баги
- Страница "все игроки" не работает
- При клике на игрока страница прыгает вверх (scroll reset)
- Страница /analytics не открывается

## Ускорение сборки (текущее время ~8.5с, ~650ms на каждую SSG-страницу)
- Кешировать QUERY_BASE в datacms.js — site settings одинаковый для всех страниц, сейчас запрашивается ~50 раз
- Promise.all для параллельных fetch в getStaticProps — сейчас 2 последовательных await
- Вернуть пустой paths: [] в getStaticPaths — генерировать все динамические страницы по запросу (ISR/blocking), а не при билде
- Turbopack для dev-режима (next dev --turbopack)
- Рассмотреть чтение SQLite напрямую при билде на сервере (без HTTP fetch)
- Рассмотреть переход с output: 'export' (SSG) на SSR/ISR — убирает необходимость ребилда при изменении данных

## Обновить пакеты
DONE. `next` 14 → 15
DONE. `react` / `react-dom` 18 → 19
- `sharp` 0.32 → 0.33 — баги, безопасность
- `prettier` 1.x → 3.x

## Удалить deprecated пакеты
DONE. `@datocms/cma-client-node` — мигрировано на локальный SQLite API
DONE. `request` — удалён (не использовался)
DONE. `react-head` — удалён (не использовался)
DONE. `dotenv` — удалён (не использовался)
DONE. `gh-pages` — удалён (не использовался)
DONE. `react-helmet` → `next/head`
DONE. `react-slick` + `slick-carousel` → `swiper` (ImageSlider компонент)
DONE. `react-masonry-component` → CSS grid

## Рефакторинг
DONE. DatoCMS → локальный SQLite API (scripts/migrate-datocms.js)
DONE. `.nvmrc` обновлён v12 → v20
DONE. keywords: убран "gatsby"
- Удалить templates/ директорию (Gatsby legacy)
- react-query 3.x — deprecated, заменить на @tanstack/react-query 5 или убрать если не используется
