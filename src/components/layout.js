import "@fontsource/open-sans/300.css"; // Defaults to weight 400 with all styles included.
import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import Footer from "./footer";
import Header from "./header";

const GlobalStyle = createGlobalStyle`
  body {
    font-family: "Open Sans", sans-serif;
    margin: 0px;
  }
`;

const Layout = ({ children }) => {
  return (
    <div>
      <GlobalStyle />
      <Header />
      <div>{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
