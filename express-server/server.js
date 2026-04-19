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
  } catch (e) {
    console.error('cta_events bootstrap failed:', e.message);
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
  '/analytics'
]);


// trust proxy нужен чтобы req.ip корректно читался за reverse-proxy/CDN,
// иначе rate-limit и ip_hash будут считаться по адресу прокси.
app.set('trust proxy', true);

// JSON body для /c/cta-event и /c/page-view. Небольшой лимит — нам
// прилетают только короткие события, защищаемся от флуда.
app.use('/c/cta-event', express.json({ limit: '2kb' }));

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
    if (!ALLOWED_CTA_IDS.has(ctaId)) {
      return res.status(400).send({ ok: false, description: 'unknown cta_id' });
    }

    const anonId = typeof body.anon_id === 'string' && UUID_V4_RE.test(body.anon_id)
      ? body.anon_id
      : null;
    const pathStr = clampStr(body.path, 512);
    const referer = clampStr(body.referer ?? req.headers.referer, 512);
    const ua = clampStr(req.headers['user-agent'], 512);

    await db.run(
      'INSERT INTO cta_events (cta_id, path, anon_id, user_agent, referer, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ctaId, pathStr, anonId, ua, referer, hashIp(ip), new Date().toISOString()
    );

    // Beacon игнорирует тело ответа, но возвращаем 204 чтобы не тратить
    // трафик — fetch keepalive fallback тоже корректно это обработает.
    res.status(204).end();
  } catch (e) {
    res.status(500).send({ ok: false, description: e.message });
  }
});

app.use('/', express.static(path.join(__dirname, '..', 'out')));

app.use('/img', express.static(path.join(__dirname, '..', 'img')));

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