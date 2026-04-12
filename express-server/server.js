const express = require('express')
const path = require('path');
const app = express()
const fs = require('fs'),
  http = require('http'),
  https = require('https');
// const bodyParser = require('body-parser');
// const fileUpload = require('express-fileupload');
const { openDb } = require('./db/Connect');
const multer = require('multer');

let db;

(async () => {
  db = await openDb()
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
  '/add'
]);


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

  // OG-теги для ботов (VK, Telegram, WhatsApp)
  const botUa = (req.headers['user-agent'] || '').toLowerCase();
  const isBot = botUa.includes('bot') || botUa.includes('crawler') || botUa.includes('spider')
    || botUa.includes('vkshare') || botUa.includes('telegram') || botUa.includes('whatsapp')
    || botUa.includes('facebookexternalhit') || botUa.includes('twitterbot');

  if (isBot && req.path.includes('/page/') && req.query.id) {
    try {
      // Определяем pageId из пути: /app/page/team → team, /app/page/game → game
      const pathParts = req.path.split('/');
      const pageId = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];

      const descriptions = {
        team: 'Статистика, форма, расписание матчей и прогнозы. Соревнуйся с друзьями!',
        game: 'Сделай прогноз на матч и соревнуйся с друзьями в рейтинге!',
      };

      // Запрашиваем данные страницы для получения title
      const apiHttp = require('https');
      const pageData = await new Promise((resolve) => {
        const postData = JSON.stringify({ pageId, id: req.query.id });
        const options = {
          hostname: 'api.fc-sever.ru',
          port: 83,
          path: '/api/page',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
          rejectUnauthorized: false,
          timeout: 5000,
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

      const title = pageData?.result?.header?.headerLeft?.props?.title || 'GameChallenge';
      const description = descriptions[pageId] || 'Прогнозируй матчи КФЛ и соревнуйся с друзьями!';

      const html = fs.readFileSync(appHtmlPath, 'utf-8');
      const ogTags = `
        <meta property="og:title" content="${title} — GameChallenge" />
        <meta property="og:description" content="${description}" />
        <meta property="og:url" content="https://fc-sever.ru${req.originalUrl}" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="GameChallenge" />
      `;
      const modifiedHtml = html.replace('</head>', ogTags + '</head>');
      res.send(modifiedHtml);
      return;
    } catch (e) {}
  }

  // OG-теги для остальных /app/* (общие)
  if (isBot) {
    try {
      const html = fs.readFileSync(appHtmlPath, 'utf-8');
      const ogTags = `
        <meta property="og:title" content="GameChallenge — Прогнозы на матчи КФЛ" />
        <meta property="og:description" content="Делай прогнозы на матчи Калужской футбольной лиги и соревнуйся с друзьями в рейтинге!" />
        <meta property="og:url" content="https://fc-sever.ru${req.originalUrl}" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="GameChallenge" />
      `;
      const modifiedHtml = html.replace('</head>', ogTags + '</head>');
      res.send(modifiedHtml);
      return;
    } catch (e) {}
  }

  // Обычный запрос — отдаём SPA
  res.sendFile(appHtmlPath);
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