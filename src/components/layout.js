import "@fontsource/open-sans/300.css"; // Defaults to weight 400 with all styles included.
import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import Footer from "./footer";
import Header from "./header";

const GlobalStyle = createGlobalStyle`
  body {
    font-family: "Open Sans", sans-serif;
  }
`;

const ContentContainer = styled.div`
  margin-bottom: 6rem;
`;

const Layout = ({ children }) => {
  return (
    <div style={{ margin: "auto", width: "85%" }}>
      <GlobalStyle />
      <Header />
      <ContentContainer>{children}</ContentContainer>
      <Footer />
    </div>
  );
};

export default Layout;
