import React from "react";
import { Toolbar, IconButton, Typography, Stack, Button, useMediaQuery, useTheme } from "@mui/material";
import TelegramIcon from '@mui/icons-material/Telegram';
import { LogoSvg } from "../../../../components/LogoSvg";
import { AppBarRoot, RightContainer, SocialContainer, Title } from "./styles";
import { TELEGRAM_URI, VK_URI } from "../../../../config/social";
import { Tab } from "./Tab";
import { useMobile } from '../../../../hooks/adaptive'
export const Header = () => {
  const s_0_600 = useMobile();

  const handleClick = () => {
    document.location.href = '/app'
  }

  const handleMainClick = () => {
    document.location.href = '/';
  }



  return (
    <AppBarRoot>
      <Toolbar>
        <IconButton style={{marginLeft: s_0_600 ? '-20px' : '0'}} onClick={handleMainClick} size="small">
          <LogoSvg />
        </IconButton>
        <RightContainer>
          <Stack direction={s_0_600 ? 'column' : 'row'} spacing={2} alignItems='center'>
            <Stack>
              <Button onClick={handleMainClick}>
                <Title isMobile={s_0_600} variant={s_0_600 ? 'h7' : 'h5'} component="h1">
                  Северный
                </Title>
              </Button>
              <Tab onClick={handleClick}>
                Турнир прогнозистов
              </Tab>
            </Stack>
          </Stack>
          <SocialContainer>
            <IconButton href={TELEGRAM_URI} target="_blank" disableRipple color="inherit"><TelegramIcon /></IconButton>
            <IconButton href={VK_URI} target="_blank" disableRipple color="inherit"><Typography variant="button">ВК</Typography></IconButton>
          </SocialContainer>
        </RightContainer>
      </Toolbar>
    </AppBarRoot >
  );
};
