import "@fontsource/open-sans/300.css"; // Defaults to weight 400 with all styles included.
import { AnchorLink as BaseAnchorLink } from "gatsby-plugin-anchor-links";
import React from "react";
import styled from "styled-components";
import CV from "./cv";
import Email from "./email";
import Github from "./github";

const HeaderContainer = styled.header`
  height: 40px;
  display: flex;
  align-items: center;
  background-color: #f45b2b;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const AnchorLink = styled(BaseAnchorLink)`
  color: white;
  font-size: 18;
  text-decoration: none;
  margin-left: 75px;
  @media (max-width: 900px) {
    margin-left: 20px;
  }
`;

const Nav = styled.nav`
  @media (max-width: 900px) {
    display: none;
  }
`;

const NavItem = styled.li`
  display: inline;
  padding: 8px;
`;

const LinksContainer = styled.div`
  margin-left: auto;
  margin-right: 10px;
`;

const Header = () => {
  return (
    <HeaderContainer>
      <AnchorLink to="/#intro" title="Adam Coogan" />
      <Nav>
        <ul>
          <NavItem>
            <AnchorLink to="/#research" title="Research" />
          </NavItem>
          <NavItem>
            <AnchorLink to="/#papers" title="Papers" />
          </NavItem>
          <NavItem>
            <AnchorLink to="/#code" title="Code" />
          </NavItem>
          <NavItem>
            <AnchorLink to="/#non-work" title="Non-work" />
          </NavItem>
        </ul>
      </Nav>

      <LinksContainer>
        <CV />
        <Email />
        <Github />
      </LinksContainer>
    </HeaderContainer>
  );
};

export default Header;
