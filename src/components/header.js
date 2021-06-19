import "@fontsource/open-sans/300.css"; // Defaults to weight 400 with all styles included.
import { Link } from "gatsby";
import React from "react";
import styled from "styled-components";

const HeaderItem = styled.li`
  display: inline;
  padding: 8px;
`;

const NavLink = (props) => {
  return <Link activeStyle={{ color: "red" }} {...props} />;
};

const Header = () => {
  return (
    <header style={{ display: "flex", alignItems: "center" }}>
      <h1 style={{ display: "inline" }}>
        <Link to="/">Adam Coogan</Link>
      </h1>

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
