import React from "react";
import styled from "styled-components";
import DefaultColumnContainer from "./columncontainer";
import DefaultTextContainer from "./textcontainer";
import DefaultImage from "./image";
import Column from "./column";
import Buttermilks from "../images/buttermilks.jpg";

const ColumnContainer = styled(DefaultColumnContainer)`
  background-color: #232323;
`;

const TextContainer = styled(DefaultTextContainer)`
  color: white;
`;

const Image = styled(DefaultImage)`
  @media (max-width: 750px) {
    min-height: 550px;
  }
`;

const Text = () => (
  <TextContainer>
    <h1>Research themes</h1>
    <ul>
      <li>
        <strong>Strong gravitational lensing.</strong> How can we use machine
        learning to probe the smallest dark matter structures in the universe in
        images of dramatically distorted galaxies?
      </li>
      <li>
        <strong>Gravitational wave probes of new physics.</strong> What imprint
        does a black hole binary’s environment leave on its gravitational wave
        signal? How can we uncover this it in data?
      </li>
      <li>
        <strong>Dark matter indirect detection.</strong> How can we best utilize
        cosmic rays and gamma rays to learn about the fundamental nature of dark
        matter, be it a particle or something else?
      </li>
      <li>
        <strong>Machine learning and statistics.</strong> What new precision
        data analyses can we unlock using modern machine learning and
        computational statistics?
      </li>
    </ul>
  </TextContainer>
);

const Research = () => (
  <ColumnContainer>
    <Column style={{ flexGrow: 3 }}>
      <Text />
    </Column>
    <Column style={{ flexGrow: 2 }}>
      <Image src={Buttermilks} />
    </Column>
  </ColumnContainer>
);

export default Research;
