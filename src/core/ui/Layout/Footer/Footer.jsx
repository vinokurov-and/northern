import React from 'react'
import Link from 'next/link'
import { Box, Container, Stack, Typography } from '@mui/material'

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 3,
        backgroundColor: 'rgba(40, 40, 90, 0.98)',
        color: 'rgba(255, 255, 255, 0.85)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 3 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            © 2026 fc-sever.ru
          </Typography>

          <Stack direction="row" spacing={3}>
            <Link
              href="/privacy"
              style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              Политика конфиденциальности
            </Link>
            <Link
              href="/terms"
              style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              Пользовательское соглашение
            </Link>
          </Stack>

          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {/* TODO(privacy@fc-sever.ru): заменить на сервисный email после заведения (см. задачу #29) */}
            Контакт: <a href="mailto:bobr9502@gmail.com" style={{ color: '#fff' }}>bobr9502@gmail.com</a>
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
