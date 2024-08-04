import React from "react";
import { Slider } from "../Slider";
import { Header } from "./Header";
import { Main } from "./Main";

export const Layout = ({ children, disableSlider = false }) => {
  return (
    <>
      <Header />
      {!disableSlider && <Slider />}
      {disableSlider && <div style={{paddingTop: 110}} />}
      <Main>
        {children}
      </Main>
    </>
  );
};

// https://colorscheme.ru/#3Z51Tvzh6w0w0
