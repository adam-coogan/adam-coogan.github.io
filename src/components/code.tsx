import React from "react";
import styled from "styled-components";

const Container = styled.div`
  margin: 0px;
  background-color: #232323;
  color: white;
  padding: 80px 220px 80px 220px;
`;

const A = styled.a`
  color: white;
`;

const MonospaceSpan = styled.span`
  font-family: Courier New;
`;

const ACode = (props) => (
  <A {...props}>
    <MonospaceSpan>{props.children}</MonospaceSpan>
  </A>
);

const ArxivLink = ({ number }) => (
  <A href={`https://arxiv.org/abs/${number}`}>{number}</A>
);

// const LightningBolt = () => (
//   <span role="img" aria-label="lightning bolt">
//     ⚡️
//   </span>
// );
//
// const Compass = () => (
//   <span role="img" aria-label="compass">
//     🧭
//   </span>
// );
//
// const Graph = () => (
//   <span role="img" aria-label="graph">
//     📈
//   </span>
// );
//
// const FryingPan = () => (
//   <span role="img" aria-label="frying pan">
//     🍳
//   </span>
// );

const Code = () => (
  <Container>
    <h1>Code</h1>
    <p>
      My <A href="https://github.com/adam-coogan">Github page</A> contains code
      for some of my papers and other projects, including:
    </p>
    <ul>
      <li>
        <ACode href="https://github.com/LoganAMorrison/Hazma">Hazma</ACode>
        : a python toolkit to compute indirect detection constraints for dark
        matter models producing MeV gamma rays. Co-developed with Logan Morrison
        and used in several of our papers: <ArxivLink number="1907.11846" />,{" "}
        <ArxivLink number="2010.04797 " />, <ArxivLink number="2101.10370" />,{" "}
        <ArxivLink number="2104.06168" />.
      </li>
      <li>
        <ACode href="https://github.com/adam-coogan/diffjeom">diffjeom</ACode>:
        differential geometry powered by{" "}
        <ACode href="https://github.com/google/jax">jax</ACode>
        's{" "}
        <A href="https://en.wikipedia.org/wiki/Automatic_differentiation">
          automatic differentiation
        </A>{" "}
        engine. You provide a metric tensor, diffjeom gives you the Christoffel
        symbols, scalar curvature, and more.
      </li>
      <li>
        <ACode href="https://github.com/adam-coogan/jaxinterp2d">
          jaxinterp2d
        </ACode>
        : simple bilinear interpolation on regular grids with{" "}
        <ACode href="https://github.com/google/jax">jax</ACode>.
      </li>
      <li>
        <A href="https://tasty-base.web.app/">Tasty Base</A>: a React + Firebase
        app for keeping track of your recipes and finding new ones. I built
        Tasty Base with my partner, Laura Henn, who’s a web developer. Source
        code <A href="https://github.com/lhenn/tasty-base">here</A>.
      </li>
    </ul>
  </Container>
);

export default Code;
