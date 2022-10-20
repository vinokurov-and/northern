import React from "react";
import { ThemeProvider as ThemeProviderMUI, createTheme } from "@mui/material";

const primary = "#0F115F";

const secondary = "#347aab";

const theme = createTheme({
  palette: {
    primary: {
      main: primary
    },
    secondary: {
      main: secondary,
      "100": "#e8f1f8"
    }
  }
});

export const ThemeProvider = ({ children }) => {
  return <ThemeProviderMUI theme={theme}>{children}</ThemeProviderMUI>;
};
