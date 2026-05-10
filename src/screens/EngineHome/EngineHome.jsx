// Лендинг Engine для fc-sever.ru. Заменяет legacy-блоки расформированного
// ФК Северного (News, Players) на витрину движка любительского футбола
// Калужской области.
//
// Структура (PRD club-pages.md, итерация 2026-05-10):
//   1. Hero — заголовок + поиск команды (autocomplete по /api/teams-search)
//   2. Ближайший матч — реюз MatchPredictWidget (1 ближайший)
//   3. Превью клубов — 12 случайных team + кнопка «Все клубы → /teams»
//
// Total-палитра: #30463B accent, #F5F7F5 фон, system-fontstack. Без MUI
// в цветовых решениях — только sx-стили с фиксированными HEX. Это
// согласовано с buildEngineStyles в express-server/server.js.

import { useEffect, useMemo, useState } from 'react';
import { Box, Container, Grid, Stack, Typography, useTheme, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import { MatchPredictWidget } from '../MatchPredictWidget';

const TOTAL_ACCENT = '#30463B';
const TOTAL_BG = '#F5F7F5';
const TOTAL_CARD_BG = '#FFFFFF';
const TOTAL_BORDER = '#E5E7EB';
const TOTAL_TEXT = '#1F2937';
const TOTAL_TEXT_MUTED = '#6B7280';

const TeamSearch = () => {
    const [q, setQ] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (q.trim().length < 2) {
            setResults([]);
            return;
        }
        let cancelled = false;
        setLoading(true);
        const t = setTimeout(() => {
            fetch(`https://api.fc-sever.ru:83/api/teams-search?q=${encodeURIComponent(q)}`)
                .then((r) => (r.ok ? r.json() : null))
                .then((j) => {
                    if (cancelled) return;
                    setResults(j?.ok && Array.isArray(j.result) ? j.result : []);
                })
                .catch(() => {})
                .finally(() => !cancelled && setLoading(false));
        }, 200);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [q]);

    return (
        <Box sx={{ position: 'relative', maxWidth: 480, mx: 'auto', width: '100%' }}>
            <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder="Найти команду — например ФК Темп"
                style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '14px 16px',
                    fontSize: 16,
                    borderRadius: 12,
                    border: `1px solid ${TOTAL_BORDER}`,
                    background: TOTAL_CARD_BG,
                    color: TOTAL_TEXT,
                    outline: 'none',
                    fontFamily: 'inherit',
                }}
            />
            {open && q.trim().length >= 2 && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        mt: 1,
                        background: TOTAL_CARD_BG,
                        border: `1px solid ${TOTAL_BORDER}`,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        maxHeight: 360,
                        overflow: 'auto',
                        zIndex: 10,
                    }}
                >
                    {loading && (
                        <Box sx={{ p: 2, color: TOTAL_TEXT_MUTED, fontSize: 14 }}>Ищу...</Box>
                    )}
                    {!loading && results.length === 0 && (
                        <Box sx={{ p: 2, color: TOTAL_TEXT_MUTED, fontSize: 14 }}>
                            Ничего не нашли. Может команды нет в базе.
                        </Box>
                    )}
                    {!loading && results.map((t) => (
                        <Link key={t.slug} href={`/team/${t.slug}`} legacyBehavior>
                            <a
                                style={{
                                    display: 'block',
                                    padding: '12px 16px',
                                    color: TOTAL_TEXT,
                                    textDecoration: 'none',
                                    borderBottom: `1px solid ${TOTAL_BORDER}`,
                                }}
                            >
                                {t.title}
                            </a>
                        </Link>
                    ))}
                </Box>
            )}
        </Box>
    );
};

const TeamsPreview = () => {
    const [teams, setTeams] = useState([]);
    useEffect(() => {
        fetch('https://api.fc-sever.ru:83/api/teams-random?n=12')
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => setTeams(j?.ok && Array.isArray(j.result) ? j.result.slice(0, 12) : []))
            .catch(() => {});
    }, []);
    return (
        <Box sx={{ mt: 5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography
                    sx={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: TOTAL_TEXT,
                    }}
                >
                    Команды области
                </Typography>
                <Link href="/teams" legacyBehavior>
                    <a style={{ color: TOTAL_ACCENT, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                        Все →
                    </a>
                </Link>
            </Stack>
            <Grid container spacing={1}>
                {teams.map((t) => (
                    <Grid item xs={6} sm={4} md={3} key={t.slug}>
                        <Link href={`/team/${t.slug}`} legacyBehavior>
                            <a
                                style={{
                                    display: 'block',
                                    padding: '14px 12px',
                                    background: TOTAL_CARD_BG,
                                    border: `1px solid ${TOTAL_BORDER}`,
                                    borderRadius: 12,
                                    color: TOTAL_TEXT,
                                    textDecoration: 'none',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    textAlign: 'center',
                                    minHeight: 56,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {t.title}
                            </a>
                        </Link>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

const EngineHeader = () => (
    <Box
        sx={{
            background: TOTAL_CARD_BG,
            borderBottom: `1px solid ${TOTAL_BORDER}`,
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}
    >
        <Container maxWidth="md">
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: 1.5 }}
            >
                <Link href="/" legacyBehavior>
                    <a style={{ color: TOTAL_ACCENT, textDecoration: 'none', fontSize: 18, fontWeight: 700 }}>
                        fc-sever.ru
                    </a>
                </Link>
                <Link href="/app/list" legacyBehavior>
                    <a
                        style={{
                            background: TOTAL_ACCENT,
                            color: '#FFFFFF',
                            textDecoration: 'none',
                            padding: '8px 16px',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                        }}
                    >
                        Прогнозы
                    </a>
                </Link>
            </Stack>
        </Container>
    </Box>
);

export const EngineHome = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width:600px)');
    return (
        <Box sx={{ background: TOTAL_BG, minHeight: '100vh', pb: 8 }}>
            <EngineHeader />
            <Container maxWidth="md" sx={{ pt: { xs: 4, sm: 6 }, pb: 4 }}>
                <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                        sx={{
                            fontSize: { xs: 28, sm: 36 },
                            fontWeight: 700,
                            color: TOTAL_TEXT,
                            lineHeight: 1.2,
                        }}
                    >
                        Любительский футбол<br />Калужской области
                    </Typography>
                    <Typography sx={{ color: TOTAL_TEXT_MUTED, fontSize: { xs: 14, sm: 16 } }}>
                        341 клуб, 6 турниров, расписание и результаты
                    </Typography>
                </Stack>
                <TeamSearch />
                <Box sx={{ mt: 5 }}>
                    <Typography
                        sx={{ fontSize: 18, fontWeight: 600, color: TOTAL_TEXT, mb: 2 }}
                    >
                        Ближайший матч
                    </Typography>
                    <MatchPredictWidget />
                </Box>
                <TeamsPreview />
                <Box sx={{ mt: 5, p: 3, background: TOTAL_CARD_BG, border: `1px solid ${TOTAL_BORDER}`, borderRadius: 2 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: TOTAL_TEXT, mb: 1 }}>
                        Капитан клуба?
                    </Typography>
                    <Typography sx={{ color: TOTAL_TEXT_MUTED, fontSize: 14, mb: 2 }}>
                        Забери страницу команды — добавь логотип, состав, расскажи болельщикам.
                    </Typography>
                    <Link href="https://t.me/totaltournaments_bot?start=claim" legacyBehavior>
                        <a
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                background: TOTAL_ACCENT,
                                color: '#FFFFFF',
                                textDecoration: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 14,
                            }}
                        >
                            Открыть бота
                        </a>
                    </Link>
                </Box>
            </Container>
        </Box>
    );
};
