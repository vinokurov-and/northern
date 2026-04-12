# TODO — Northern (fc-sever.ru)

## Баги
DONE. Новости отображались в обратном порядке (старые сверху). Корень: VK импорт через wall.get идёт от новых к старым → insertion order в БД соответствует "малый id = новый пост". Старый код делал news.reverse(), что давало старые сверху. Убрал reverse() в news.js, добавил `ORDER BY id ASC` в `/c/news` для явности. Долгосрочно — добавить колонку `date` в таблицу `news` и сортировать по ней (новый импорт VK должен сохранять wall_post.date)
DONE. Страница "все игроки" не работает — URL был /player (singular), а кнопка навигировала на /players (plural). Перенесён player.js → players/index.js, обновлён pathMap в express-server
DONE. При клике на игрока страница прыгает вверх (scroll reset) — добавлен experimental.scrollRestoration: true в next.config.js
DONE. Страница /analytics не открывалась — создана analytics.js (client-side fetch /c/analytics), добавлена в pathMap
- Ускорить деплой. Сейчас npm i - 1m. 34s. build total client - 38s. 

## CI/CD
DONE. fix: deploy зависал на ~8+ минут на шаге "Deploy static site" — `scp -r out` через тысячи мелких файлов в `_expo/static/js/web/` без keepalive молча зависал, ssh-сессия рвалась но scp на runner'е этого не замечал. Заменено на `rsync -az --delete --partial` + ServerAliveInterval=30 + ConnectTimeout=30 + timeout-minutes на шагах деплоя

## Ускорение сборки (текущее время ~8.5с, ~650ms на каждую SSG-страницу)
DONE. Кешировать QUERY_BASE в datacms.js — siteSettingsCache, запрашивается 1 раз вместо ~50
DONE. Promise.all для параллельных fetch в getStaticProps — players/index, players/[slug], games/[slug], works/[slug]
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
DONE. Удалить templates/ — уже удалена
- react-query 3.x — deprecated, заменить на @tanstack/react-query 5 или убрать если не используется
