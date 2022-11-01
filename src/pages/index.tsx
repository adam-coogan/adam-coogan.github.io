import React from "react";
import styled from "styled-components";
import Layout from "../components/layout";
import Intro from "../components/intro";
import Research from "../components/research";
import Papers from "../components/papers";
import Sierras from "../components/sierras";
import Code from "../components/code";
import NonWork from "../components/nonwork";

// TODO: HACK to get anchor offset right...
const Anchor = styled.a`
  display: block;
  position: relative;
  top: -39px;
  visibility: hidden;
`;

const Home = () => (
  <Layout>
    <Anchor id="intro" />
    <Intro />

    <Anchor id="research" />
    <Research />

    <Anchor id="papers" />
    <Papers />

    <Sierras />

    <Anchor id="code" />
    <Code />

    <Anchor id="non-work" />
    <NonWork />
  </Layout>
);

export default Home;
