import React from "react";
import { Slider } from "../Slider";
import { Header } from "./Header";
import { Main } from "./Main";
import { GamesAnnouncementScreen } from "../../../screens/GamesAnnouncmentGames/GamesAnnouncmentGames";

export const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <Slider />
      <Main>
        <GamesAnnouncementScreen />
        {children}</Main>
    </>
  );
};

// https://colorscheme.ru/#3Z51Tvzh6w0w0
