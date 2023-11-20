import React from "react";
import { Toolbar, IconButton, Typography } from "@mui/material";
import TelegramIcon from '@mui/icons-material/Telegram';
import { LogoSvg } from "../../../../components/LogoSvg";
import { AppBarRoot, RightContainer, SocialContainer, Title } from "./styles";
import { TELEGRAM_URI, VK_URI } from "../../../../config/social";

export const Header = () => {
  return (
    <AppBarRoot>
      <Toolbar>
        <IconButton size="small">
          <LogoSvg />
        </IconButton>

      <RightContainer>
        <Title variant="h5" component="h1">
          Северный
        </Title>
        <SocialContainer>
          <IconButton href={TELEGRAM_URI} target="_blank" disableRipple color="inherit"><TelegramIcon /></IconButton>
          <IconButton href={VK_URI} target="_blank" disableRipple color="inherit"><Typography variant="button">ВК</Typography></IconButton>
        </SocialContainer>
        </RightContainer>
      </Toolbar>
    </AppBarRoot>
  );
};
