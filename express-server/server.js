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
  '/player',
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
    const result = await db.all("SELECT * FROM news");
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

app.use('/', express.static(path.join(__dirname, '..', 'out')));

app.use('/img', express.static(path.join(__dirname, '..', 'img')));

app.get('/app/*', sendFile('app/index.html'));

// Other paths, check whether to show page or 404(not found) page
app.get('*', (req, res) => {
  const p = req.path;
  if (pathMap.has(p)) res.sendFile(path.resolve(dir, '..', 'out', `${p.slice(1)}.html`));
  else res.sendFile(path.resolve(dir, '..', 'out', '404.html'));
});

https.createServer(options, app).listen(port, function () {
  console.log("Express server listening on port " + port);
});