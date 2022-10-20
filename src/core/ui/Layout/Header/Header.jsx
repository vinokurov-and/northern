import React from "react";
import { AppBar, Toolbar, IconButton } from "@mui/material";
import { LogoSvg } from "../../../../components/LogoSvg";
import { Title } from "./styles";

export const Header = () => {
  return (
    <AppBar>
      <Toolbar>
        <IconButton size="small">
          <LogoSvg />
        </IconButton>

        <Title variant="h5" component="h1">
          Северный
        </Title>
      </Toolbar>
    </AppBar>
  );
};
