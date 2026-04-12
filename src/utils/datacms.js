// Локальный API-клиент (замена DatoCMS GraphQL)
// Данные хранятся в northern SQLite, доступны через express-server API

const API_BASE = 'https://fc-sever.ru';

// Кеш site-settings — одинаковый для всех страниц, не нужно запрашивать ~50 раз при билде
let siteSettingsCache = null;

export const fetchLocal = async (endpoint) => {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            signal: AbortSignal.timeout(5000),
        });
        const json = await response.json();
        if (!json.ok) {
            console.warn(`[datacms] API error for ${endpoint}:`, json.description);
            return null;
        }
        return json.result;
    } catch (e) {
        console.warn(`[datacms] Fetch failed for ${endpoint}:`, e.message);
        return null;
    }
};

// Совместимость со старым API — возвращаем данные в формате DatoCMS
export const client = async ({ query }) => {
    // Определяем какие данные запрашиваются по содержимому query
    const data = {};

    if (query.includes('_site') || query.includes('home') || query.includes('allSocialProfiles')) {
        if (!siteSettingsCache) {
            siteSettingsCache = await fetchLocal('/c/site-settings') || {};
        }
        const settings = siteSettingsCache;
        data._site = {
            globalSeo: { siteName: settings.siteName || 'ФК Северный' },
            faviconMetaTags: settings.faviconMetaTags || [],
        };
        data.home = {
            copyright: settings.copyright || '',
            introText: settings.introText || '',
            _seoMetaTags: settings.seoMetaTags || [],
        };
        data.allSocialProfiles = settings.socialProfiles || [];
    }

    if (query.includes('allGames')) {
        const games = await fetchLocal('/c/games-content') || [];
        data.allGames = games.map(g => ({
            ...g,
            image: g.image ? { url: g.image } : null,
            gallery: Array.isArray(g.gallery) ? g.gallery.map(url => ({ url })) : [],
        }));
    }

    if (query.includes('allWorks')) {
        const works = await fetchLocal('/c/works') || [];
        data.allWorks = works.map(w => ({
            ...w,
            coverImage: w.coverImage ? { url: w.coverImage } : null,
        }));
    }

    if (query.includes('allPlayers')) {
        const players = await fetchLocal('/c/players-content') || [];
        data.allPlayers = players.map(p => ({
            ...p,
            coverImage: p.coverImage ? { url: p.coverImage } : null,
        }));
    }

    // Детальные запросы (filter по slug)
    const gameMatch = query.match(/game\(filter:\{[\s\S]*?slug:\s*\{[\s\S]*?in:\s*"([^"]+)"/);
    if (gameMatch) {
        const game = await fetchLocal(`/c/games-content/${gameMatch[1]}`);
        data.game = game ? {
            ...game,
            image: game.image ? { url: game.image } : null,
            gallery: Array.isArray(game.gallery) ? game.gallery.map(url => ({ url })) : [],
        } : null;
    }

    const workMatch = query.match(/work\(filter:\{[\s\S]*?slug:\s*\{[\s\S]*?in:\s*"([^"]+)"/);
    if (workMatch) {
        const work = await fetchLocal(`/c/works/${workMatch[1]}`);
        data.work = work ? {
            ...work,
            coverImage: work.coverImage ? { url: work.coverImage } : null,
            gallery: Array.isArray(work.gallery) ? work.gallery.map(url => ({ url })) : [],
            game: work.game ? {
                ...work.game,
                image: work.game.image ? { url: work.game.image } : null,
                gallery: Array.isArray(work.game.gallery) ? work.game.gallery.map(url => ({ url })) : [],
            } : null,
        } : null;
    }

    const playerMatch = query.match(/player\(filter:\{[\s\S]*?slug:\s*\{[\s\S]*?in:\s*"([^"]+)"/);
    if (playerMatch) {
        const player = await fetchLocal(`/c/players-content/${playerMatch[1]}`);
        data.player = player ? {
            ...player,
            coverImage: player.coverImage ? { url: player.coverImage } : null,
            gallery: Array.isArray(player.gallery) ? player.gallery.map(url => ({ url })) : [],
        } : null;
    }

    return { data };
};

export default client;
