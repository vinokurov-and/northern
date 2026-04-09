# TODO — Northern (fc-sever.ru)

## Открытые
Страница все игроки не работает.

## Удалить deprecated пакеты
DONE. `@datocms/cma-client-node` — мигрировано на локальный SQLite API
DONE. `request` — удалён (не использовался)
DONE. `react-head` — удалён (не использовался)
DONE. `dotenv` — удалён (не использовался)
DONE. `gh-pages` — удалён (не использовался)
DONE. `react-helmet` → `next/head`
DONE. `react-slick` + `slick-carousel` → `swiper` (ImageSlider компонент)
DONE. `react-masonry-component` → CSS grid

## Обновить пакеты
- `next` 14 → 15 — Turbopack, улучшенный SSG, Server Components
- `react` / `react-dom` 18 → 19 — новые хуки, Server Components
- `sharp` 0.32 → 0.33 — баги, безопасность
- `prettier` 1.x → 3.x

## Рефакторинг
DONE. DatoCMS → локальный SQLite API (scripts/migrate-datocms.js)
DONE. `.nvmrc` обновлён v12 → v20
DONE. keywords: убран "gatsby"
- Удалить templates/ директорию (Gatsby legacy)
