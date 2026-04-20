import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { trackCtaClick, trackCtaView } from '../../../utils/analytics';

/**
 * Рекламный слот с инфраструктурой трекинга.
 *
 * Props:
 * - ctaId (string, required): идентификатор слота. Схема:
 *     ad-<network>-<место>
 *   Примеры: `ad-admitad-home-footer`, `ad-admitad-player-card`,
 *   `ad-adsterra-news-inline`.
 *   Whitelist на сервере: см. ALLOWED_CTA_IDS и ALLOWED_CTA_ID_PATTERNS
 *   в express-server/server.js — ctaId обязан им соответствовать,
 *   иначе /c/cta-event отвечает 400.
 * - erid (string, optional): ERID-маркировка по ФЗ «О рекламе» (§18.1).
 *   Если задан — рендерим плашку «Реклама. ERID: {erid}».
 * - html (string, optional): HTML-код от партнёрской сети. Пустой/отсутствует
 *   — показываем плейсхолдер для проверки слотов до одобрения сети.
 * - category (string, optional): доп. атрибут для аналитики, сейчас не
 *   отправляется на сервер (whitelist ctaId уже несёт семантику места).
 *
 * События:
 * - `trackCtaView(ctaId)` на mount (рекламный слот отрисовался).
 * - `trackCtaClick(ctaId)` на любой клик внутри обёртки (делегирование,
 *   работает в том числе для ссылок внутри партнёрского HTML).
 *
 * XSS: `html` вставляется через `dangerouslySetInnerHTML`. Доверяем
 * только коду проверенных сетей (Admitad/Adsterra), добавление любой
 * другой сети = обновление whitelist + ревью кода.
 */
export const AdBlock = ({ ctaId, erid, html, category }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    trackCtaView(ctaId);
    // category намеренно не шлётся — серверная схема пока этого поля не знает.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctaId]);

  const handleClick = () => {
    trackCtaClick(ctaId);
  };

  const hasHtml = typeof html === 'string' && html.trim().length > 0;

  return (
    <Box
      ref={containerRef}
      data-cta-id={ctaId}
      data-ad-category={category || undefined}
      onClick={handleClick}
      sx={{
        width: '100%',
        my: 2,
      }}
    >
      {erid && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: 'rgba(0, 0, 0, 0.54)',
            fontSize: '0.7rem',
            mb: 0.5,
          }}
        >
          Реклама. ERID: {erid}
        </Typography>
      )}
      {hasHtml ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <Box
          sx={{
            width: '100%',
            maxWidth: 300,
            minHeight: 250,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed rgba(0, 0, 0, 0.3)',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            color: 'rgba(0, 0, 0, 0.54)',
            fontSize: '0.875rem',
            textAlign: 'center',
            p: 2,
            boxSizing: 'border-box',
          }}
        >
          Место для рекламы
        </Box>
      )}
    </Box>
  );
};
