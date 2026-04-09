/**
 * Миграция данных из DatoCMS GraphQL API → Northern SQLite.
 * Запуск: node scripts/migrate-datocms.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const DATOCMS_TOKEN = '2124294997ad966cac498651561bd0';
const DB_PATH = path.join(__dirname, '..', 'express-server', 'db', 'db-northen.sqlite');

async function datocmsQuery(query) {
    const response = await fetch('https://graphql.datocms.com/', {
        headers: { 'Authorization': `Bearer ${DATOCMS_TOKEN}` },
        method: 'POST',
        body: JSON.stringify({ query }),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(`DatoCMS: ${JSON.stringify(json)}`);
    return json.data;
}

async function main() {
    console.log('БД:', DB_PATH);
    const db = new Database(DB_PATH);

    // Таблицы
    db.exec(`
        CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE IF NOT EXISTS social_profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, profileType TEXT, url TEXT);
        CREATE TABLE IF NOT EXISTS games_content (id TEXT PRIMARY KEY, slug TEXT UNIQUE, date TEXT, teamHome TEXT, guestTeam TEXT, stadium TEXT, pointHome TEXT, pointGuest TEXT, description TEXT, image TEXT, gallery TEXT);
        CREATE TABLE IF NOT EXISTS works (id TEXT PRIMARY KEY, slug TEXT UNIQUE, title TEXT, excerpt TEXT, description TEXT, coverImage TEXT, gallery TEXT, gameSlug TEXT);
        CREATE TABLE IF NOT EXISTS players_content (id TEXT PRIMARY KEY, slug TEXT UNIQUE, title TEXT, excerpt TEXT, coverImage TEXT, description TEXT, gallery TEXT);
    `);

    // Site settings
    console.log('\n=== Site Settings ===');
    const site = await datocmsQuery(`{
        _site { globalSeo { siteName } faviconMetaTags { tag content attributes __typename } }
        home { copyright introText _seoMetaTags { tag content attributes __typename } }
        allSocialProfiles { profileType url }
    }`);

    const upsert = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
    upsert.run('siteName', site._site.globalSeo.siteName);
    upsert.run('faviconMetaTags', JSON.stringify(site._site.faviconMetaTags));
    upsert.run('copyright', site.home.copyright);
    upsert.run('introText', site.home.introText);
    upsert.run('seoMetaTags', JSON.stringify(site.home._seoMetaTags));
    console.log('siteName:', site._site.globalSeo.siteName);

    db.exec('DELETE FROM social_profiles');
    const insertSP = db.prepare('INSERT INTO social_profiles (profileType, url) VALUES (?, ?)');
    for (const sp of site.allSocialProfiles) insertSP.run(sp.profileType, sp.url);
    console.log('Social profiles:', site.allSocialProfiles.length);

    // Games
    console.log('\n=== Games ===');
    const games = await datocmsQuery(`{
        allGames {
            id slug date teamHome guestTeam stadium pointHome pointGuest description
            image { url } gallery { url }
        }
    }`);

    db.exec('DELETE FROM games_content');
    const insertGame = db.prepare('INSERT INTO games_content (id, slug, date, teamHome, guestTeam, stadium, pointHome, pointGuest, description, image, gallery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const g of games.allGames) {
        insertGame.run(g.id, g.slug, g.date, g.teamHome, g.guestTeam, g.stadium, g.pointHome, g.pointGuest, g.description, g.image?.url || null, g.gallery ? JSON.stringify(g.gallery.map(i => i.url)) : null);
    }
    console.log('Games:', games.allGames.length);

    // Works
    console.log('\n=== Works ===');
    const works = await datocmsQuery(`{
        allWorks {
            id slug title excerpt description
            coverImage { url } gallery { url } game { slug }
        }
    }`);

    db.exec('DELETE FROM works');
    const insertWork = db.prepare('INSERT INTO works (id, slug, title, excerpt, description, coverImage, gallery, gameSlug) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const w of works.allWorks) {
        insertWork.run(w.id, w.slug, w.title, w.excerpt, w.description, w.coverImage?.url || null, w.gallery ? JSON.stringify(w.gallery.map(i => i.url)) : null, w.game?.slug || null);
    }
    console.log('Works:', works.allWorks.length);

    // Players
    console.log('\n=== Players ===');
    const players = await datocmsQuery(`{
        allPlayers { id slug title excerpt coverImage { url } }
    }`);

    db.exec('DELETE FROM players_content');
    const insertPlayer = db.prepare('INSERT INTO players_content (id, slug, title, excerpt, coverImage) VALUES (?, ?, ?, ?, ?)');
    for (const p of players.allPlayers) {
        insertPlayer.run(p.id, p.slug, p.title, p.excerpt, p.coverImage?.url || null);
    }
    console.log('Players:', players.allPlayers.length);

    // Player details
    console.log('\n=== Player details ===');
    const updatePlayer = db.prepare('UPDATE players_content SET description = ?, gallery = ? WHERE slug = ?');
    for (const p of players.allPlayers) {
        try {
            const detail = await datocmsQuery(`{ player(filter: { slug: { in: "${p.slug}" } }) { description gallery { url } } }`);
            if (detail.player) {
                updatePlayer.run(detail.player.description, detail.player.gallery ? JSON.stringify(detail.player.gallery.map(i => i.url)) : null, p.slug);
            }
        } catch (e) {
            console.error(`Ошибка ${p.slug}:`, e.message);
        }
    }

    db.close();
    console.log('\n✅ Миграция завершена!');
}

main().catch(e => { console.error('Ошибка:', e); process.exit(1); });
