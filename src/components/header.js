import "@fontsource/open-sans/300.css"; // Defaults to weight 400 with all styles included.
import { Link } from "gatsby";
import React from "react";
import styled from "styled-components";

const HeaderItem = styled.li`
  display: inline;
  padding: 8px;
`;

const NavLink = styled(Link)`
  color: white;
  font-size: 18;
  text-decoration: none;
`;

const Header = () => {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#F45B2B",
      }}
    >
      <NavLink to="/">Adam Coogan</NavLink>

      <nav>
        <ul>
          <HeaderItem>
            <NavLink to="/about/">About me</NavLink>
          </HeaderItem>
          <HeaderItem>
            <NavLink to="/research/">Research</NavLink>
          </HeaderItem>
          <HeaderItem>
            <NavLink to="/code/">Code</NavLink>
          </HeaderItem>
          <HeaderItem>
            <NavLink to="/cv/">CV</NavLink>
          </HeaderItem>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
