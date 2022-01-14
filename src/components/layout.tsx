import "@fontsource/open-sans";
import React from "react";
import { createGlobalStyle } from "styled-components";
import Header from "./header";

const GlobalStyle = createGlobalStyle`
  body {
    font-family: "Open Sans", sans-serif;
    margin: 0px;
    font-weight: 300;
    width: 100%;
    background-color: #f45b2b;
  }
`;

const Layout = ({ children }) => {
  return (
    <>
      <GlobalStyle />
      <Header />
      <>{children}</>
    </>
  );
};

export default Layout;
