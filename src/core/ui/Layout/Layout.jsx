import React from "react";
import { Header } from "./Header";
import { Main } from "./Main";

export const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <Main>{children}</Main>
    </>
  );
};

// https://colorscheme.ru/#3Z51Tvzh6w0w0
