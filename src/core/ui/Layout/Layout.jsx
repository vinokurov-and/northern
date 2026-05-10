import React from "react";
import { Slider } from "../Slider";
import { Header } from "./Header";
import { Main } from "./Main";
import { Footer } from "./Footer";

export const Layout = ({ children, disableSlider = false, disableHeader = false }) => {
  // disableHeader — для главной Engine (отдельный header в EngineHome).
  // Legacy-страницы (/players, /news, /works) сохраняют старый Header
  // ФК Северного, потому что они и есть legacy раздел.
  return (
    <>
      {!disableHeader && <Header />}
      {!disableSlider && <Slider />}
      {disableSlider && !disableHeader && <div style={{paddingTop: 110}} />}
      <Main>
        {children}
      </Main>
      <Footer />
    </>
  );
};

// https://colorscheme.ru/#3Z51Tvzh6w0w0
