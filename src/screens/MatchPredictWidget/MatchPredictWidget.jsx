import { useEffect, useState } from "react";
import { Stack, Button, useTheme, useMediaQuery, Skeleton } from "@mui/material";
import Link from "next/link";
import { S_0, S_600 } from "../../breakpoints";

const MONTHS_RU_GEN = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const formatDate = (unixSec) => {
    if (!unixSec) return '';
    const d = new Date(unixSec * 1000);
    const day = d.getDate();
    const month = MONTHS_RU_GEN[d.getMonth()];
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month}, ${hh}:${mm}`;
};

const widgetLink = (gameId) =>
    `/match/${gameId}?utm_source=northern&utm_medium=widget&utm_campaign=match_predict`;

export const MatchPredictWidget = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.between(S_0, S_600));

    const [match, setMatch] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetch('https://api.fc-sever.ru:83/api/next-match')
            .then((r) => r.ok ? r.json() : null)
            .then((j) => {
                if (cancelled) return;
                if (j && j.ok && j.result) setMatch(j.result);
                else setError(true);
                setLoaded(true);
            })
            .catch(() => {
                if (cancelled) return;
                setError(true);
                setLoaded(true);
            });
        return () => { cancelled = true; };
    }, []);

    const containerPad = isMobile ? '0 20px' : '0 60px';
    const cardPad = isMobile ? '20px' : '32px 40px';

    return (
        <Stack style={{ padding: containerPad, marginTop: isMobile ? 26 : 40 }}>
            <Stack
                style={{
                    background: 'linear-gradient(135deg, #30463B 0%, #1f2e26 100%)',
                    borderRadius: 16,
                    padding: cardPad,
                    color: '#FFFFFF',
                    boxShadow: '0 8px 24px rgba(48,70,59,0.15)',
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: isMobile ? 22 : 32,
                        fontWeight: 700,
                        lineHeight: '110%',
                        color: '#FFFFFF',
                    }}
                >
                    Сделай прогноз на матч КФЛ
                </h2>

                {!loaded && (
                    <Stack style={{ marginTop: 20, gap: 12 }}>
                        <Skeleton variant="text" width="60%" height={28} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
                        <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
                        <Skeleton variant="rectangular" width={isMobile ? '100%' : 220} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1, marginTop: 1 }} />
                    </Stack>
                )}

                {loaded && match && (
                    <>
                        <p
                            style={{
                                margin: '12px 0 4px',
                                fontSize: isMobile ? 18 : 22,
                                fontWeight: 600,
                                color: '#FFFFFF',
                            }}
                        >
                            {match.home}{' '}—{' '}{match.guest}
                        </p>
                        <p
                            style={{
                                margin: 0,
                                fontSize: isMobile ? 14 : 16,
                                color: '#B1C5B6',
                            }}
                        >
                            {formatDate(match.datetime)}
                            {match.tournament && match.tournament.name
                                ? `${' · '}${match.tournament.name}`
                                : ''}
                        </p>
                        <Stack direction={isMobile ? 'column' : 'row'} gap={isMobile ? 1 : 2} style={{ marginTop: 20 }}>
                            <Link href={widgetLink(match.gameId)} style={{ textDecoration: 'none' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        background: '#FFFFFF',
                                        color: '#30463B',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        '&:hover': { background: '#E7EBD6' },
                                        width: isMobile ? '100%' : 'auto',
                                    }}
                                >
                                    Сделать прогноз
                                </Button>
                            </Link>
                            <Link href="/app/list?utm_source=northern&utm_medium=widget&utm_campaign=all_matches" style={{ textDecoration: 'none' }}>
                                <Button
                                    variant="text"
                                    size="large"
                                    sx={{
                                        color: '#B1C5B6',
                                        textTransform: 'none',
                                        '&:hover': { background: 'rgba(255,255,255,0.08)' },
                                        width: isMobile ? '100%' : 'auto',
                                    }}
                                >
                                    Все матчи
                                </Button>
                            </Link>
                        </Stack>
                    </>
                )}

                {loaded && !match && (
                    <>
                        <p
                            style={{
                                margin: '12px 0 0',
                                fontSize: isMobile ? 14 : 16,
                                color: '#B1C5B6',
                            }}
                        >
                            {error
                                ? 'Сейчас не получается загрузить ближайший матч. Все матчи —'
                                : 'Сейчас нет ближайших матчей. Все матчи —'}
                        </p>
                        <Stack style={{ marginTop: 16 }}>
                            <Link href="/app/list?utm_source=northern&utm_medium=widget&utm_campaign=all_matches" style={{ textDecoration: 'none' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        background: '#FFFFFF',
                                        color: '#30463B',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        '&:hover': { background: '#E7EBD6' },
                                        width: isMobile ? '100%' : 'auto',
                                    }}
                                >
                                    Открыть приложение
                                </Button>
                            </Link>
                        </Stack>
                    </>
                )}
            </Stack>
        </Stack>
    );
};
