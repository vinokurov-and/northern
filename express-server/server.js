const express = require('express')
const path = require('path');
const app = express()
const fs = require('fs'),
  http = require('http'),
  https = require('https'),
  crypto = require('crypto');
// const bodyParser = require('body-parser');
// const fileUpload = require('express-fileupload');
const { openDb } = require('./db/Connect');
const multer = require('multer');

let db;

(async () => {
  db = await openDb();
  // Safety net: миграция 004 должна быть применена через `npm run migrate`,
  // но если по какой-то причине этого не сделали — создаём таблицу лениво,
  // чтобы /c/cta-event не падал 500 на проде.
  try {
    await db.run(`CREATE TABLE IF NOT EXISTS cta_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL DEFAULT 'click',
      cta_id TEXT NOT NULL,
      path TEXT,
      anon_id TEXT,
      user_agent TEXT,
      referer TEXT,
      ip_hash TEXT,
      created_at TEXT NOT NULL
    )`);
    await db.run('CREATE INDEX IF NOT EXISTS idx_cta_events_created_at ON cta_events(created_at)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_cta_events_cta_id ON cta_events(cta_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_cta_events_event_type ON cta_events(event_type)');
  } catch (e) {
    console.error('cta_events bootstrap failed:', e.message);
  }
  try {
    await db.run(`CREATE TABLE IF NOT EXISTS page_views_v2 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      anon_id TEXT,
      user_agent TEXT,
      referer TEXT,
      ip_hash TEXT,
      created_at TEXT NOT NULL
    )`);
    await db.run('CREATE INDEX IF NOT EXISTS idx_page_views_v2_created_at ON page_views_v2(created_at)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_page_views_v2_path ON page_views_v2(path)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_page_views_v2_anon_id ON page_views_v2(anon_id)');
  } catch (e) {
    console.error('page_views_v2 bootstrap failed:', e.message);
  }
})();



const port = 443;

const dir = __dirname;

const sendFile = (template) => (req, res) => {
  const params = req.params;
  res.sendFile(path.resolve(dir, '..', 'out', template.replace(/\[\w+\]/g, (match) => params[match.slice(1, -1)])));
};

const sendPage = (template) => (req, res) => {
  const params = req.params;

  const page = fs.readFileSync(path.resolve(dir, '..', 'out', template.replace(/\[\w+\]/g, (match) => params[match.slice(1, -1)])), 'utf8');
  
  res.send(page);
};


const options = {
  // key: fs.readFileSync('./cert/private.pem'),
  // cert: fs.readFileSync('./cert/public.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/fc-sever.ru/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/fc-sever.ru/fullchain.pem')
};

const pathMap = new Set([
  '/news',
  '/players',
  '/game',
  '/stats',
  '/add',
  '/analytics',
  '/privacy',
  '/terms'
]);


// trust proxy нужен чтобы req.ip корректно читался за reverse-proxy/CDN,
// иначе rate-limit и ip_hash будут считаться по адресу прокси.
app.set('trust proxy', true);

// JSON body для /c/cta-event и /c/page-view. Небольшой лимит — нам
// прилетают только короткие события, защищаемся от флуда.
app.use('/c/cta-event', express.json({ limit: '2kb' }));
app.use('/c/page-view', express.json({ limit: '2kb' }));

app.use('/', express.static(path.join(__dirname, '..', 'out')));

// Nextjs dynamic routing
app.get('/works/:workID', sendPage('works/[workID].html'));
app.get('/players/:player', sendPage('players/[player].html'));
app.get('/games/:gameID', sendPage('games/[gameID].html'));


app.get('/c/news', async (req, res) => {
  try {
    // VK новости были импортированы через wall.get (новые VK → старые),
    // insertion order совпадает с id, значит ORDER BY id ASC выдаёт новые VK сверху.
    // Если в будущем добавить колонку date — сортировать по ней DESC.
    const result = await db.all("SELECT * FROM news WHERE hide IS NULL OR hide = 0 ORDER BY id ASC");
    res.send({ ok: true, result });
    return;
  } catch (e) {
    res.send({ ok: false, description: e.message });
    return;
  }
});

app.get('/c/players', async (req, res) => {
  try {
    const result = await db.all("SELECT * FROM players where players.hide is null or players.hide = 0");
    res.send({ok: true, result});
    return;
  } catch (e) {
    res.send({ ok: false, description: e.message });
    return;
  }
})

// === API для данных (замена DatoCMS) ===

app.get('/c/site-settings', async (req, res) => {
  try {
    const rows = await db.all("SELECT key, value FROM site_settings");
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    // Парсим JSON-поля
    try { settings.faviconMetaTags = JSON.parse(settings.faviconMetaTags); } catch {}
    try { settings.seoMetaTags = JSON.parse(settings.seoMetaTags); } catch {}
    const socialProfiles = await db.all("SELECT profileType, url FROM social_profiles");
    res.send({ ok: true, result: { ...settings, socialProfiles } });
  } catch (e) {
    res.send({ ok: false, description: e.message });
  }
});

app.get('/c/games-content', async (req, res) => {
  try {
    const result = await db.all("SELECT * FROM games_content");
    result.forEach(r => { try { r.gallery = JSON.parse(r.gallery); } catch {} });
    res.send({ ok: true, result });
  } catch (e) {
    res.send({ ok: false, description: e.message });
  }
});

app.get('/c/games-content/:slug', async (req, res) => {
  try {
    const result = await db.get("SELECT * FROM games_content WHERE slug = ?", req.params.slug);
    if (result) {
      try { result.gallery = JSON.parse(result.gallery); } catch {}
    }
    res.send({ ok: true, result: result || null });
  } catch (e) {
    res.send({ ok: false, description: e.message });
  }
});

app.get('/c/works', async (req, res) => {
  try {
    const result = await db.all("SELECT id, slug, title, excerpt, coverImage FROM works");
    res.send({ ok: true, result });
  } catch (e) {
    res.send({ ok: false, description: e.message });
  }
});

app.get('/c/works/:slug', async (req, res) => {
  try {
    const work = await db.get("SELECT * FROM works WHERE slug = ?", req.params.slug);
    if (work) {
      try { work.gallery = JSON.parse(work.gallery); } catch {}
      if (work.gameSlug) {
        work.game = await db.get("SELECT * FROM games_content WHERE slug = ?", work.gameSlug);
        if (work.game) { try { work.game.gallery = JSON.parse(work.game.gallery); } catch {} }
      }
    }
    res.send({ ok: true, result: work || null });
  } catch (e) {
    res.send({ ok: false, description: e.message });
  }
});

app.get('/c/players-content', async (req, res) => {
  try {
    const result = await db.all("SELECT id, slug, title, excerpt, coverImage FROM players_content");
    res.send({ ok: true, result });
  } catch (e) {
    res.send({ ok: false, description: e.message });
  }
});

app.get('/c/players-content/:slug', async (req, res) => {
  try {
    const result = await db.get("SELECT * FROM players_content WHERE slug = ?", req.params.slug);
    if (result) {
      try { result.gallery = JSON.parse(result.gallery); } catch {}
    }
    res.send({ ok: true, result: result || null });
  } catch (e) {
    res.send({ ok: false, description: e.message });
  }
});

const storage = multer.memoryStorage();

const upload = multer({ storage });

app.post('/c/addNews', upload.any(), async (req, res) => {
  try {
    const { title, description, pass } = req.body;
    if (pass === 'sever') {
      const result = await db.run("INSERT INTO news (title, description) VALUES (?, ?)", title, description);

      const id = result.lastID;

      if (req.files[0]) {

        const split = req.files[0].originalname.split('.');
        const fileExtension = split[split.length - 1]
        const name = id + '.' + fileExtension;
        const url = path.join(process.cwd(), '..', 'img') + '/' + name;
        fs.writeFileSync(url, req.files[0].buffer)
        console.log(url);

        await db.run("UPDATE news SET image = ? WHERE id = ?", '/img/' + name, id);
      }

      res.send({ ok: true });
      return;
    } else {
      res.send({ ok: false })
    }
  } catch (e) {
    res.send({ ok: false, description: e.message })
    return;
  }
});

// Аналитика — просмотр кликов
app.get('/c/analytics', async (req, res) => {
  try {
    await db.run(`CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT,
      referer TEXT,
      user_agent TEXT,
      created_at TEXT
    )`);

    const total = await db.get('SELECT COUNT(*) as count FROM page_views');
    const today = await db.get("SELECT COUNT(*) as count FROM page_views WHERE created_at >= date('now')");
    const topPages = await db.all('SELECT url, COUNT(*) as views FROM page_views GROUP BY url ORDER BY views DESC LIMIT 20');
    const recent = await db.all('SELECT url, referer, created_at FROM page_views ORDER BY id DESC LIMIT 20');

    res.send({ ok: true, result: { total: total.count, today: today.count, topPages, recent } });
  } catch (e) {
    res.send({ ok: false, description: e.message });
  }
});

// --- CTA event tracking ---
//
// Белый список допустимых cta_id. Расширяется по мере появления новых CTA.
// Соглашение по именованию: <место>_<действие>_<объект>, ASCII, без слов
// про деньги/ставки.
const ALLOWED_CTA_IDS = new Set([
  'header_forecast_button',
]);

// Гибрид: разрешаем целые семейства ad-<network>-* без перечисления каждого
// конкретного места. Точка входа — whitelist проверенных сетей; внутри сети
// добавление нового слота (home-footer → player-card → news-inline) не
// требует деплоя сервера. Случайный «ad-othernetwork-xxx» с чужого сайта
// отклоняется. Лимит длины и charset — защита от мусорных значений.
const AD_CTA_ID_RE = /^ad-(admitad|adsterra)-[a-z0-9]+(-[a-z0-9]+)*$/;
const AD_CTA_ID_MAX_LEN = 64;
const matchesAdWhitelist = (ctaId) =>
  typeof ctaId === 'string' &&
  ctaId.length <= AD_CTA_ID_MAX_LEN &&
  AD_CTA_ID_RE.test(ctaId);

// Итоговая проверка: либо точное совпадение в ALLOWED_CTA_IDS (обычные CTA),
// либо соответствие рекламному паттерну (слоты AdBlock'а).
const isAllowedCtaId = (ctaId) =>
  ALLOWED_CTA_IDS.has(ctaId) || matchesAdWhitelist(ctaId);

// view/click покрывают оба сценария: обычный CTA (header_forecast_button,
// click) и рекламный слот AdBlock (view на mount + click на делегированный
// клик внутри обёртки).
const ALLOWED_EVENT_TYPES = new Set(['click', 'view']);

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// In-memory rate-limit по IP: 20 req / 60s. Подходит для одного инстанса
// express-сервера (screen-сессия `server`). Если появится балансер/несколько
// реплик — переводим на БД или Redis.
const CTA_RATE_WINDOW_MS = 60 * 1000;
const CTA_RATE_MAX = 20;
const ctaRateBuckets = new Map();

const ctaRateLimited = (ip) => {
  const now = Date.now();
  const bucket = ctaRateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart > CTA_RATE_WINDOW_MS) {
    ctaRateBuckets.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > CTA_RATE_MAX;
};

// Периодическая чистка старых бакетов, чтобы Map не рос бесконечно.
setInterval(() => {
  const cutoff = Date.now() - CTA_RATE_WINDOW_MS;
  for (const [ip, bucket] of ctaRateBuckets) {
    if (bucket.windowStart < cutoff) ctaRateBuckets.delete(ip);
  }
}, 5 * 60 * 1000).unref();

const hashIp = (ip) =>
  crypto.createHash('sha256').update(String(ip || '')).digest('hex').slice(0, 16);

const clampStr = (v, max) => {
  if (typeof v !== 'string') return null;
  return v.length > max ? v.slice(0, max) : v;
};

app.post('/c/cta-event', async (req, res) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || '';
    if (ctaRateLimited(ip)) {
      return res.status(429).send({ ok: false, description: 'rate limited' });
    }

    const body = req.body || {};
    const ctaId = typeof body.cta_id === 'string' ? body.cta_id : '';
    if (!isAllowedCtaId(ctaId)) {
      return res.status(400).send({ ok: false, description: 'unknown cta_id' });
    }
    const eventType = typeof body.event_type === 'string' && ALLOWED_EVENT_TYPES.has(body.event_type)
      ? body.event_type
      : 'click';

    const anonId = typeof body.anon_id === 'string' && UUID_V4_RE.test(body.anon_id)
      ? body.anon_id
      : null;
    const pathStr = clampStr(body.path, 512);
    const referer = clampStr(body.referer ?? req.headers.referer, 512);
    const ua = clampStr(req.headers['user-agent'], 512);

    await db.run(
      'INSERT INTO cta_events (event_type, cta_id, path, anon_id, user_agent, referer, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      eventType, ctaId, pathStr, anonId, ua, referer, hashIp(ip), new Date().toISOString()
    );

    // Beacon игнорирует тело ответа, но возвращаем 204 чтобы не тратить
    // трафик — fetch keepalive fallback тоже корректно это обработает.
    res.status(204).end();
  } catch (e) {
    res.status(500).send({ ok: false, description: e.message });
  }
});

// --- Page view tracking ---
//
// Rate-limit 60/min на IP: страниц больше чем CTA, потолок выше.
const PAGE_RATE_WINDOW_MS = 60 * 1000;
const PAGE_RATE_MAX = 60;
const pageRateBuckets = new Map();

const pageRateLimited = (ip) => {
  const now = Date.now();
  const bucket = pageRateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart > PAGE_RATE_WINDOW_MS) {
    pageRateBuckets.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > PAGE_RATE_MAX;
};

setInterval(() => {
  const cutoff = Date.now() - PAGE_RATE_WINDOW_MS;
  for (const [ip, bucket] of pageRateBuckets) {
    if (bucket.windowStart < cutoff) pageRateBuckets.delete(ip);
  }
}, 5 * 60 * 1000).unref();

// Признаки краулеров в User-Agent: дропаем такие запросы до записи в БД,
// чтобы аналитика отражала поведение реальных пользователей.
const BOT_UA_RE = /bot|crawler|spider|crawling|yandex|googlebot|bingbot|duckduckbot|baidu|slurp|facebookexternalhit|twitterbot|telegrambot|vkshare|whatsapp|slackbot|linkedinbot|embedly|headlesschrome|phantomjs|selenium|puppeteer|playwright|curl|wget|python-requests/i;

// Путь должен начинаться с «/», без схемы/хоста. Остальное отсекаем — защита
// от подмены в теле запроса на полный URL или произвольную строку.
const PATH_RE = /^\/[^\s]*$/;

app.post('/c/page-view', async (req, res) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || '';
    if (pageRateLimited(ip)) {
      return res.status(429).send({ ok: false, description: 'rate limited' });
    }

    const ua = req.headers['user-agent'] || '';
    if (BOT_UA_RE.test(ua)) {
      // Молча принимаем и выходим: не ошибка для клиента, просто не пишем.
      return res.status(204).end();
    }

    const body = req.body || {};
    const rawPath = typeof body.path === 'string' ? body.path : '';
    if (!rawPath || !PATH_RE.test(rawPath)) {
      return res.status(400).send({ ok: false, description: 'invalid path' });
    }
    const pathStr = clampStr(rawPath, 512);

    const anonId = typeof body.anon_id === 'string' && UUID_V4_RE.test(body.anon_id)
      ? body.anon_id
      : null;
    const referer = clampStr(body.referer ?? req.headers.referer, 512);
    const uaClamped = clampStr(ua, 512);

    await db.run(
      'INSERT INTO page_views_v2 (path, anon_id, user_agent, referer, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      pathStr, anonId, uaClamped, referer, hashIp(ip), new Date().toISOString()
    );

    res.status(204).end();
  } catch (e) {
    res.status(500).send({ ok: false, description: e.message });
  }
});

app.use('/', express.static(path.join(__dirname, '..', 'out')));

app.use('/img', express.static(path.join(__dirname, '..', 'img')));

// Внутренний вызов /api/match-summary/:id на Total-API (решение A9).
// Таймаут 5s — Telegram/VK share-preview держит ~10s. Резолвится null при
// 404/ошибке, SSR отдаёт generic OG (клиент сам покажет «не найден»).
const fetchMatchSummaryRaw = (gameId) => new Promise((resolve) => {
  const apiHttps = require('https');
  const opts = {
    hostname: 'api.fc-sever.ru', port: 83, path: `/api/match-summary/${gameId}`,
    method: 'GET', rejectUnauthorized: false, timeout: 5000,
    headers: { 'User-Agent': 'northern-ssr' },
  };
  const r = apiHttps.request(opts, (resp) => {
    if (resp.statusCode !== 200) return resolve(null);
    let data = '';
    resp.on('data', (c) => data += c);
    resp.on('end', () => {
      try {
        const j = JSON.parse(data);
        resolve(j && j.ok ? j.result : null);
      } catch {
        resolve(null);
      }
    });
  });
  r.on('error', () => resolve(null));
  r.on('timeout', () => { r.destroy(); resolve(null); });
  r.end();
});

// Memory-cache для /api/match-summary (guardrail в ssr-match-pages.md §6:
// SSR-страница для бота должна отдаваться < 1с p95). Парсер обновляет счета
// раз в 6ч, 5 мин stale полностью безопасны. На total уже есть 60с
// Cache-Control, но http-кеш в ноде без отдельной библиотеки не работает —
// держим Map. Размер ограничен размером выборки sitemap (тыс. матчей);
// чистим устаревшие записи при попадании.
const MATCH_SUMMARY_TTL_MS = 5 * 60 * 1000;
const matchSummaryCache = new Map();

const fetchMatchSummary = async (gameId) => {
  const key = String(gameId);
  const cached = matchSummaryCache.get(key);
  const now = Date.now();
  if (cached && now - cached.ts < MATCH_SUMMARY_TTL_MS) {
    return cached.value;
  }
  const value = await fetchMatchSummaryRaw(gameId);
  // Кешируем даже null — чтобы 404-флуд не бил по total. ttl тот же.
  matchSummaryCache.set(key, { ts: now, value });
  // Опpортунистически чистим протухшие записи если кеш разросся.
  if (matchSummaryCache.size > 5000) {
    for (const [k, v] of matchSummaryCache) {
      if (now - v.ts >= MATCH_SUMMARY_TTL_MS) matchSummaryCache.delete(k);
    }
  }
  return value;
};

// Получение списка id матчей для генерации /sitemap.xml. Cache 1ч в памяти.
const SITEMAP_TTL_MS = 60 * 60 * 1000;
let sitemapCache = { ts: 0, value: null };
let sitemapTeamsCache = { ts: 0, value: null };

const fetchTotalApi = (apiPath) => new Promise((resolve) => {
  const apiHttps = require('https');
  const opts = {
    hostname: 'api.fc-sever.ru', port: 83, path: apiPath,
    method: 'GET', rejectUnauthorized: false, timeout: 10000,
    headers: { 'User-Agent': 'northern-ssr' },
  };
  const r = apiHttps.request(opts, (resp) => {
    if (resp.statusCode !== 200) return resolve(null);
    let data = '';
    resp.on('data', (c) => data += c);
    resp.on('end', () => {
      try {
        const j = JSON.parse(data);
        resolve(j && j.ok && Array.isArray(j.result) ? j.result : null);
      } catch {
        resolve(null);
      }
    });
  });
  r.on('error', () => resolve(null));
  r.on('timeout', () => { r.destroy(); resolve(null); });
  r.end();
});

const fetchSitemapGames = () => fetchTotalApi('/api/sitemap-games');
const fetchSitemapTeams = () => fetchTotalApi('/api/sitemap-teams');

// /api/team/<slug> на total-API. Cache 5 мин в памяти. Возвращает null
// при 404/ошибке/таймауте — SSR отдаёт generic 404 fallback.
const TEAM_PAGE_TTL_MS = 5 * 60 * 1000;
const teamPageCache = new Map();

const fetchTeamPageRaw = (slug) => new Promise((resolve) => {
  const apiHttps = require('https');
  const opts = {
    hostname: 'api.fc-sever.ru', port: 83, path: `/api/team/${encodeURIComponent(slug)}`,
    method: 'GET', rejectUnauthorized: false, timeout: 5000,
    headers: { 'User-Agent': 'northern-ssr' },
  };
  const r = apiHttps.request(opts, (resp) => {
    if (resp.statusCode !== 200) return resolve(null);
    let data = '';
    resp.on('data', (c) => data += c);
    resp.on('end', () => {
      try {
        const j = JSON.parse(data);
        resolve(j && j.ok ? j.result : null);
      } catch {
        resolve(null);
      }
    });
  });
  r.on('error', () => resolve(null));
  r.on('timeout', () => { r.destroy(); resolve(null); });
  r.end();
});

const fetchTeamPage = async (slug) => {
  const key = String(slug);
  const cached = teamPageCache.get(key);
  const now = Date.now();
  if (cached && now - cached.ts < TEAM_PAGE_TTL_MS) return cached.value;
  const value = await fetchTeamPageRaw(slug);
  teamPageCache.set(key, { ts: now, value });
  if (teamPageCache.size > 5000) {
    for (const [k, v] of teamPageCache) {
      if (now - v.ts >= TEAM_PAGE_TTL_MS) teamPageCache.delete(k);
    }
  }
  return value;
};

const escapeHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const MONTHS_RU = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const formatMatchDate = (unixSec) => {
  if (!unixSec) return '';
  const d = new Date(unixSec * 1000);
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
};

const pickLeadingPercent = (forecast, home, guest) => {
  const { home: h, guest: g, draw: d } = forecast;
  if (h >= g && h >= d) return `${h}% ставят на победу ${home}`;
  if (g >= h && g >= d) return `${g}% ставят на победу ${guest}`;
  return `${d}% ждут ничьей`;
};

// SSR-тело для bot UA (US-1 в docs/prd/ssr-match-pages.md). Инжектится
// в <div id="root">. Для людей React удалит этот HTML при первом рендере
// (createRoot имеет seamless replace, без flash). Для ботов — единственный
// текст, индексируется. Включает h1, абзац с датой/турниром/счётом, %
// прогнозов и 2 кросс-линка на соседние матчи (US-4).
const buildMatchSsrBody = (m) => {
  if (!m) return '';
  const dateStr = formatMatchDate(m.datetime);
  const isFinished = m.state === 'finished' && m.homeScore != null && m.guestScore != null;
  const score = isFinished ? `${m.homeScore}:${m.guestScore}` : '';

  const headParts = [];
  if (dateStr) headParts.push(escapeHtml(dateStr));
  if (m.tournament && m.tournament.name) headParts.push(escapeHtml(m.tournament.name));
  if (score) headParts.push(escapeHtml(score));
  // Live-state маркер для индексации (spec docs/superpowers/specs/2026-05-01-live-match-ux-design).
  // Без эмодзи — текст лучше для ранжирования.
  if (m.state === 'live' && !score) headParts.push('Матч идёт');
  const headLine = headParts.length ? `<p>${headParts.join(' · ')}</p>` : '';

  let forecastBlock = '';
  if (m.forecast && m.forecast.total >= 1) {
    const total = m.forecast.total;
    const pct = (n) => Math.round((n / total) * 100);
    const homePct = pct(m.forecast.home);
    const guestPct = pct(m.forecast.guest);
    const drawPct = pct(m.forecast.draw);
    forecastBlock = `
      <p>Прогнозы болельщиков:</p>
      <ul>
        <li>Победа ${escapeHtml(m.home)} — ${homePct}%</li>
        <li>Победа ${escapeHtml(m.guest)} — ${guestPct}%</li>
        <li>Ничья — ${drawPct}%</li>
      </ul>`;
  }

  let linksBlock = '';
  if (Array.isArray(m.siblings) && m.siblings.length > 0) {
    const items = m.siblings.map((s) => {
      const sDate = formatMatchDate(s.datetime);
      const tail = sDate ? ` (${escapeHtml(sDate)})` : '';
      return `<li><a href="/match/${s.gameId}">${escapeHtml(s.home)} — ${escapeHtml(s.guest)}</a>${tail}</li>`;
    }).join('');
    const tournamentLabel = m.tournament && m.tournament.name
      ? `Другие матчи: ${escapeHtml(m.tournament.name)}`
      : 'Другие матчи турнира';
    linksBlock = `
      <h2>${tournamentLabel}</h2>
      <ul>${items}</ul>`;
  }

  return `
    <h1>${escapeHtml(m.home)} — ${escapeHtml(m.guest)}</h1>
    ${headLine}
    ${forecastBlock}
    ${linksBlock}
  `;
};

// JSON-LD SportsEvent — для upcoming и finished (решение A10, Schema.org).
const buildMatchJsonLd = (m) => {
  const statusMap = { upcoming: 'EventScheduled', live: 'EventInProgress', finished: 'EventCompleted' };
  const json = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${m.home} — ${m.guest}`,
    sport: 'Football',
    url: `https://fc-sever.ru/match/${m.gameId}`,
    eventStatus: `https://schema.org/${statusMap[m.state] || 'EventScheduled'}`,
    homeTeam: { '@type': 'SportsTeam', name: m.home },
    awayTeam: { '@type': 'SportsTeam', name: m.guest },
  };
  if (m.datetime) json.startDate = new Date(m.datetime * 1000).toISOString();
  if (m.state === 'finished' && m.homeScore != null && m.guestScore != null) {
    json.homeTeamScore = m.homeScore;
    json.awayTeamScore = m.guestScore;
  }
  if (m.tournament && m.tournament.name) {
    json.superEvent = { '@type': 'SportsEvent', name: m.tournament.name };
  }
  return json;
};

// SSR-роут Tap-to-Predict (решения team-lead A1-A13). Один canonical URL
// обслуживает все три состояния матча (A3, A10): upcoming/live/finished.
// OG-image — статичный шаблон (A2), без рендеринга на лету.
app.get('/match/:gameId', async (req, res) => {
  const appHtmlPath = path.resolve(dir, '..', 'out', 'app/index.html');
  const gameId = req.params.gameId;

  if (!/^[1-9]\d*$/.test(gameId)) {
    return res.redirect(302, '/app/list');
  }

  // Логируем SSR-запросы в ту же page_views что и /app/*.
  try {
    const url = req.originalUrl;
    const referer = req.headers.referer || '';
    const ua = req.headers['user-agent'] || '';
    await db.run(
      'INSERT INTO page_views (url, referer, user_agent, created_at) VALUES (?, ?, ?, ?)',
      url, referer, ua, new Date().toISOString()
    );
  } catch {}

  let html;
  try {
    html = fs.readFileSync(appHtmlPath, 'utf-8');
  } catch {
    return res.status(500).send('App shell missing');
  }

  const m = await fetchMatchSummary(gameId);
  const canonicalUrl = `https://fc-sever.ru/match/${gameId}`;

  let title, description, jsonLd = '';
  if (!m) {
    // 404 от API или таймаут — generic OG, шелл всё равно отдаём, клиент
    // сам покажет «матч не найден» (MatchCardScreen fallback).
    title = 'Прогноз на матч КФЛ — GameChallenge';
    description = 'Сделай прогноз на матч Калужской футбольной лиги в один тап.';
  } else {
    const dateStr = formatMatchDate(m.datetime);
    const dateTail = dateStr ? `, ${dateStr}` : '';
    if (m.state === 'finished' && m.homeScore != null && m.guestScore != null) {
      title = `${m.home} ${m.homeScore}:${m.guestScore} ${m.guest}${dateTail} — GameChallenge`;
      description = `Матч ${m.home} — ${m.guest} завершён со счётом ${m.homeScore}:${m.guestScore}. Посмотри, кто угадал.`;
    } else {
      title = `${m.home} — ${m.guest}${dateTail} — Прогноз на матч`;
      const leadMsg = m.forecast && m.forecast.total >= 10
        ? pickLeadingPercent(m.forecast, m.home, m.guest)
        : 'Сделай прогноз за один тап';
      description = `${leadMsg}. ${m.home} — ${m.guest}${dateTail}.`;
    }
    jsonLd = `<script type="application/ld+json">${JSON.stringify(buildMatchJsonLd(m))}</script>`;
  }

  const metaTags = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="GameChallenge" />
    <meta property="og:image" content="https://fc-sever.ru/img/og/match-default.png" />
    <link rel="canonical" href="${canonicalUrl}" />
    ${jsonLd}
  `;

  // SSR body только для ботов (US-1, US-2 в ssr-match-pages.md). Для людей
  // SPA-shell как сейчас — никаких regressions. Bot UA-regex переиспользуем
  // тот же что и для page-views (BOT_UA_RE).
  let body = html.replace('</head>', metaTags + '</head>');
  const ua = req.headers['user-agent'] || '';
  if (m && BOT_UA_RE.test(ua)) {
    const ssrBody = buildMatchSsrBody(m);
    // <div id="root"></div> создаётся React Native Web в out/app/index.html.
    // Если в будущем структура поменяется — делаем no-op.
    body = body.replace(
      /<div id="root"><\/div>/,
      `<div id="root">${ssrBody}</div>`,
    );
  }
  res.send(body);
});

// SSR-тело для bot UA на странице клуба (PRD docs/prd/club-pages.md).
// Hero (название), 4 секции (расписание/результаты/состав/прогноз),
// внутренние ссылки на матчи. Тон без слов «прогноз/ставка» в hero —
// это сайт клуба, не букмекер (UI direction §10).
const buildTeamSsrBody = (t) => {
  if (!t) return '';
  const parts = [];
  parts.push(`<h1>${escapeHtml(t.title)}</h1>`);

  const upcoming = Array.isArray(t.upcomingMatches) ? t.upcomingMatches : [];
  if (upcoming.length > 0) {
    parts.push('<h2>Ближайшие матчи</h2>');
    const items = upcoming.map((m) => {
      const date = formatMatchDate(m.datetime);
      return `<li><a href="/match/${m.gameId}">${escapeHtml(m.home)} — ${escapeHtml(m.guest)}</a>${date ? ` (${escapeHtml(date)})` : ''}</li>`;
    }).join('');
    parts.push(`<ul>${items}</ul>`);
  }

  const past = Array.isArray(t.pastMatches) ? t.pastMatches : [];
  if (past.length > 0) {
    parts.push('<h2>Последние результаты</h2>');
    const items = past.map((m) => {
      const date = formatMatchDate(m.datetime);
      const score = (m.homeScore != null && m.guestScore != null) ? ` ${m.homeScore}:${m.guestScore}` : '';
      return `<li><a href="/match/${m.gameId}">${escapeHtml(m.home)} —${escapeHtml(score)} ${escapeHtml(m.guest)}</a>${date ? ` (${escapeHtml(date)})` : ''}</li>`;
    }).join('');
    parts.push(`<ul>${items}</ul>`);
  }

  if (Array.isArray(t.roster) && t.roster.length > 0) {
    parts.push('<h2>Состав</h2>');
    parts.push(`<ul>${t.roster.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`);
  }

  if (t.tournament && t.tournament.name) {
    parts.push(`<p>Турнир: ${escapeHtml(t.tournament.name)}</p>`);
  }

  return parts.join('\n');
};

// JSON-LD SportsTeam — для индексации (Q1: addressRegion=Калужская область).
const buildTeamJsonLd = (t) => {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: t.title,
    sport: 'Football',
    url: `https://fc-sever.ru/team/${t.slug}`,
    location: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressRegion: 'Калужская область', addressCountry: 'RU' },
    },
  };
  if (t.logo && t.logo.url) {
    json.logo = `https://api.fc-sever.ru:83${t.logo.url}`;
  }
  return json;
};

// SSR-роут /team/:slug — клубные страницы, центр PRD club-pages.md.
// Один canonical URL, generic OG image, JSON-LD SportsTeam. Hero без слов
// «прогноз/ставка» (UI direction). Если slug не валиден или API 404 —
// шелл всё равно отдаём, клиент сам покажет 404 fallback с 5 random teams.
app.get('/team/:slug', async (req, res) => {
  const appHtmlPath = path.resolve(dir, '..', 'out', 'app/index.html');
  const slug = String(req.params.slug || '').toLowerCase();

  if (!/^[a-z0-9-]{1,80}$/.test(slug)) {
    return res.redirect(302, '/app/list');
  }

  try {
    const url = req.originalUrl;
    const referer = req.headers.referer || '';
    const ua = req.headers['user-agent'] || '';
    await db.run(
      'INSERT INTO page_views (url, referer, user_agent, created_at) VALUES (?, ?, ?, ?)',
      url, referer, ua, new Date().toISOString()
    );
  } catch {}

  let html;
  try {
    html = fs.readFileSync(appHtmlPath, 'utf-8');
  } catch {
    return res.status(500).send('App shell missing');
  }

  const t = await fetchTeamPage(slug);
  const canonicalUrl = `https://fc-sever.ru/team/${slug}`;

  let title, description, jsonLd = '';
  if (!t) {
    title = 'Клуб не найден — fc-sever.ru';
    description = 'Команда не найдена. Открой главную и выбери клуб из списка.';
  } else {
    title = `${t.title} — расписание и результаты — Калужская футбольная лига`;
    description = `${t.title}: расписание ближайших матчей, последние результаты, прогнозы болельщиков.`;
    jsonLd = `<script type="application/ld+json">${JSON.stringify(buildTeamJsonLd(t))}</script>`;
  }

  const metaTags = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="GameChallenge" />
    <meta property="og:image" content="https://fc-sever.ru/img/og/match-default.png" />
    <link rel="canonical" href="${canonicalUrl}" />
    ${jsonLd}
  `;

  let body = html.replace('</head>', metaTags + '</head>');
  const ua = req.headers['user-agent'] || '';
  if (t && BOT_UA_RE.test(ua)) {
    const ssrBody = buildTeamSsrBody(t);
    body = body.replace(
      /<div id="root"><\/div>/,
      `<div id="root">${ssrBody}</div>`,
    );
  }
  res.send(body);
});

// Sitemap для SEO (US-3 в ssr-match-pages.md). Cache 1ч в памяти, под
// неудачу total-API отдаём 503 (не stale 404 — пусть Yandex повторит).
app.get('/sitemap.xml', async (req, res) => {
  const now = Date.now();
  let games = sitemapCache.value;
  if (!games || now - sitemapCache.ts >= SITEMAP_TTL_MS) {
    games = await fetchSitemapGames();
    if (games) sitemapCache = { ts: now, value: games };
  }
  let teams = sitemapTeamsCache.value;
  if (!teams || now - sitemapTeamsCache.ts >= SITEMAP_TTL_MS) {
    teams = await fetchSitemapTeams();
    if (teams) sitemapTeamsCache = { ts: now, value: teams };
  }
  if (!games && !teams) {
    return res.status(503).type('text/plain').send('sitemap unavailable');
  }
  const datedGames = (games || []).filter((g) => g && g.datetime).slice(0, 30000);
  const gamesUrls = datedGames.map((g) => {
    const lastmod = new Date(g.datetime * 1000).toISOString().slice(0, 10);
    return `  <url><loc>https://fc-sever.ru/match/${g.id}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq></url>`;
  }).join('\n');

  // Club pages: один URL на slug, lastmod = MAX(games.datetime) per team.
  // Не теряем команды без upcoming-матчей (lastmod=null) — они индексируются
  // как «вечно-зелёные» страницы клуба, без <lastmod>.
  const teamsList = (teams || []).slice(0, 5000);
  const teamsUrls = teamsList.map((t) => {
    if (!t || !t.slug) return '';
    if (t.lastmod) {
      const lastmod = new Date(t.lastmod * 1000).toISOString().slice(0, 10);
      return `  <url><loc>https://fc-sever.ru/team/${t.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq></url>`;
    }
    return `  <url><loc>https://fc-sever.ru/team/${t.slug}</loc><changefreq>monthly</changefreq></url>`;
  }).filter(Boolean).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://fc-sever.ru/</loc><changefreq>daily</changefreq></url>
  <url><loc>https://fc-sever.ru/app/list</loc><changefreq>daily</changefreq></url>
${teamsUrls}
${gamesUrls}
</urlset>`;
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.type('application/xml').send(xml);
});

// Robots — закрываем /api/, /app/admin/ от индексации; остальное разрешаем
// явно (US-3, [NEEDS-APPROVAL] #6 в ssr-match-pages.md).
app.get('/robots.txt', (req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /app/admin/
Disallow: /c/

Sitemap: https://fc-sever.ru/sitemap.xml
`;
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.type('text/plain').send(robots);
});

// Аналитика кликов + OG-теги для /app/* роутов
app.get('/app/*', async (req, res) => {
  const appHtmlPath = path.resolve(dir, '..', 'out', 'app/index.html');

  // Логируем клик
  try {
    const url = req.originalUrl;
    const referer = req.headers.referer || '';
    const ua = req.headers['user-agent'] || '';
    await db.run(
      'INSERT INTO page_views (url, referer, user_agent, created_at) VALUES (?, ?, ?, ?)',
      url, referer, ua, new Date().toISOString()
    );
  } catch (e) {
    // Таблица может не существовать — создадим при первом обращении
    try {
      await db.run(`CREATE TABLE IF NOT EXISTS page_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT,
        referer TEXT,
        user_agent TEXT,
        created_at TEXT
      )`);
    } catch (e2) {}
  }

  // SEO meta + OG-теги для всех запросов /app/*
  try {
    const html = fs.readFileSync(appHtmlPath, 'utf-8');
    let title = 'GameChallenge — Прогнозы на матчи КФЛ';
    let description = 'Делай прогнозы на матчи Калужской футбольной лиги и соревнуйся с друзьями в рейтинге!';

    // Динамические страницы: /app/page/team?id=N или /app/p/team?id=N
    const pageMatch = req.path.match(/\/app\/(?:page|p)\/(\w+)/);
    if (pageMatch && req.query.id) {
      const pageId = pageMatch[1];
      const descriptions = {
        team: 'Статистика, форма, расписание матчей и результаты.',
        game: 'Сделай прогноз на матч и соревнуйся с друзьями в рейтинге!',
        privacy: 'Политика конфиденциальности приложения GameChallenge.',
        terms: 'Пользовательское соглашение приложения GameChallenge.',
      };

      // Запрашиваем title команды/игры из API
      try {
        const apiHttp = require('https');
        const pageData = await new Promise((resolve) => {
          const postData = JSON.stringify({ pageId, id: req.query.id });
          const options = {
            hostname: 'api.fc-sever.ru', port: 83, path: '/api/page', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
            rejectUnauthorized: false, timeout: 5000,
          };
          const r = apiHttp.request(options, (resp) => {
            let data = '';
            resp.on('data', c => data += c);
            resp.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
          });
          r.on('error', () => resolve(null));
          r.on('timeout', () => { r.destroy(); resolve(null); });
          r.write(postData);
          r.end();
        });
        const pageTitle = pageData?.result?.header?.headerLeft?.props?.title;
        if (pageTitle) title = pageTitle + ' — GameChallenge';
      } catch (e) {}

      description = descriptions[pageId] || description;
    }

    const metaTags = `
      <title>${title}</title>
      <meta name="description" content="${description}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:url" content="https://fc-sever.ru${req.originalUrl}" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="GameChallenge" />
      <link rel="canonical" href="https://fc-sever.ru${req.path}" />
    `;
    const modifiedHtml = html.replace('</head>', metaTags + '</head>');
    res.send(modifiedHtml);
  } catch (e) {
    res.sendFile(appHtmlPath);
  }
});

// Other paths, check whether to show page or 404(not found) page
app.get('*', (req, res) => {
  const p = req.path;
  if (pathMap.has(p)) res.sendFile(path.resolve(dir, '..', 'out', `${p.slice(1)}.html`));
  else res.sendFile(path.resolve(dir, '..', 'out', '404.html'));
});

https.createServer(options, app).listen(port, function () {
  console.log("Express server listening on port " + port);
});