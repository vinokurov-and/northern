import React, { useState } from "react";
import { 
  Toolbar, 
  IconButton, 
  Typography, 
  Stack, 
  Button, 
  AppBar,
  useScrollTrigger,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import TelegramIcon from '@mui/icons-material/Telegram';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { LogoSvg } from "../../../../components/LogoSvg";
import { AppBarRoot, RightContainer, SocialContainer, Title } from "./styles";
import { TELEGRAM_URI, VK_URI } from "../../../../config/social";
import { useMobile } from '../../../../hooks/adaptive';

export const Header = () => {
  const s_0_600 = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
  });

  const handleClick = () => {
    document.location.href = '/app';
    setMobileMenuOpen(false);
  };

  const handleMainClick = () => {
    document.location.href = '/';
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const mobileMenuContent = (
    <Box sx={{ width: 250, height: '100%', bgcolor: 'rgba(40, 40, 90, 0.98)' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        p: 1,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <IconButton 
          onClick={toggleMobileMenu}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        <ListItem>
          <Stack direction="row" spacing={2}>
            <IconButton 
              href={TELEGRAM_URI} 
              target="_blank" 
              disableRipple 
              sx={{ 
                color: 'white',
                transition: 'opacity 0.3s ease', 
                '&:hover': { opacity: 0.8 } 
              }}
            >
              <TelegramIcon />
            </IconButton>
            <IconButton 
              href={VK_URI} 
              target="_blank" 
              disableRipple 
              sx={{ 
                color: 'white',
                transition: 'opacity 0.3s ease', 
                '&:hover': { opacity: 0.8 } 
              }}
            >
              <Typography variant="button">ВК</Typography>
            </IconButton>
          </Stack>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBarRoot elevation={trigger ? 4 : 0}>
      <Toolbar 
        sx={{ 
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          background: trigger ? 'rgba(40, 40, 90, 0.95)' : 'rgba(40, 40, 90, 0.98)',
          minHeight: { xs: '100px', sm: '100px' },
          px: { xs: '16px', sm: '32px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 3 }
        }}
      >
        {/* Левая часть */}
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={{ xs: 1.5, sm: 2 }} 
          sx={{ 
            minWidth: 'fit-content',
            flexGrow: { xs: 1, sm: 0 }
          }}
        >
          <IconButton 
            onClick={handleMainClick} 
            size="small"
            sx={{ 
              padding: 0,
              width: { xs: '64px', sm: '72px' },
              height: { xs: '64px', sm: '72px' },
              transition: 'opacity 0.2s ease',
              '&:hover': { 
                backgroundColor: 'transparent',
                opacity: 0.85
              }
            }}
          >
            <LogoSvg />
          </IconButton>

          <Stack spacing={1}>
            <Button 
              onClick={handleMainClick}
              sx={{
                padding: 0,
                minWidth: 0,
                transition: 'opacity 0.2s ease',
                '&:hover': { 
                  backgroundColor: 'transparent',
                  opacity: 0.85
                }
              }}
            >
              <Title 
                isMobile={s_0_600} 
                variant={s_0_600 ? 'h6' : 'h5'} 
                component="h1"
                sx={{
                  color: '#fff',
                  letterSpacing: '0.5px',
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2
                }}
              >
                Северный
              </Title>
            </Button>
            {s_0_600 && (
              <Button 
                color="inherit" 
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  fontSize: '0.8125rem',
                  height: '32px',
                  px: '10px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                  fontWeight: 500,
                  alignSelf: 'flex-start',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
                onClick={handleClick}
              >
                Турнир прогнозистов
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Центральная часть - только для десктопа */}
        {!s_0_600 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-start',
            flexGrow: 1,
            ml: 2
          }}>
            <Button 
              color="inherit" 
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '0.875rem',
                height: '34px',
                px: '16px',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                lineHeight: 1,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                }
              }}
              onClick={handleClick}
            >
              Турнир прогнозистов
            </Button>
          </Box>
        )}

        {/* Правая часть */}
        <Stack 
          direction="row" 
          spacing={1} 
          alignItems="center"
          sx={{ 
            flexGrow: 0,
            minWidth: 'fit-content'
          }}
        >
          {!s_0_600 && (
            <SocialContainer>
              <IconButton 
                href={TELEGRAM_URI} 
                target="_blank" 
                disableRipple 
                color="inherit"
                sx={{ 
                  transition: 'opacity 0.2s ease',
                  width: { xs: '32px', sm: '36px' },
                  height: { xs: '32px', sm: '36px' },
                  '&:hover': { opacity: 0.85 }
                }}
              >
                <TelegramIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
              </IconButton>
              <IconButton 
                href={VK_URI} 
                target="_blank" 
                disableRipple 
                color="inherit"
                sx={{ 
                  transition: 'opacity 0.2s ease',
                  width: { xs: '32px', sm: '36px' },
                  height: { xs: '32px', sm: '36px' },
                  '&:hover': { opacity: 0.85 }
                }}
              >
                <Typography 
                  variant="button" 
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500 
                  }}
                >
                  ВК
                </Typography>
              </IconButton>
            </SocialContainer>
          )}
          
          {s_0_600 && (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ 
                width: '32px',
                height: '32px',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              <MenuIcon sx={{ fontSize: '1.25rem' }} />
            </IconButton>
          )}
        </Stack>

        <Drawer
          anchor="right"
          open={mobileMenuOpen}
          onClose={toggleMobileMenu}
          PaperProps={{
            sx: {
              backgroundColor: 'transparent',
              boxShadow: 'none'
            }
          }}
        >
          {mobileMenuContent}
        </Drawer>
      </Toolbar>
    </AppBarRoot>
  );
};

const navButtonStyle = {
  position: 'relative',
  transition: 'all 0.3s ease',
  padding: '6px 12px',
  borderRadius: '4px',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  }
};
