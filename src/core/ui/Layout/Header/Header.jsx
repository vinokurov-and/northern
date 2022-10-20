import React from "react";
import { AppBar, Toolbar, IconButton } from "@mui/material";
import { LogoSvg } from "../../../../components/LogoSvg";
import { AppBarRoot, Title } from "./styles";

export const Header = () => {
  return (
    <AppBarRoot>
      <Toolbar>
        <IconButton size="small">
          <LogoSvg />
        </IconButton>

        <Title variant="h5" component="h1">
          Северный
        </Title>
      </Toolbar>
    </AppBarRoot>
  );
};
