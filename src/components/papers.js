import React from "react";
import styled from "styled-components";
import ColumnContainer from "./columncontainer";
import Column from "./column";
import DefaultTextContainer from "./textcontainer";
import DefaultImage from "./image";
import Switzerland from "../images/switzerland.jpg";
import Paper from "./paper";
import PaperData from "../content/papers.yaml";

const Image = styled(DefaultImage)`
  @media (max-width: 750px) {
    display: none;
  }
`;

const TextContainer = styled(DefaultTextContainer)`
  padding: 75px;
`;

const Text = () => {
  console.log(PaperData)
  return (
    <TextContainer>
      <h1>Papers</h1>
      <p>
        You can find all my physics publications on{" "}
        <a href="https://inspirehep.net/authors/1631088">InspireHEP</a>, and
        some highlights here:
      </p>
      {PaperData.map((data, index) => (
        <Paper key={`paper_${index}`} {...data} />
      ))}
    </TextContainer>
  );
};

const Intro = () => {
  return (
    <ColumnContainer>
      <Column>
        <Image src={Switzerland} />
      </Column>
      <Column style={{flexGrow: 2}}>
        <Text />
      </Column>
    </ColumnContainer>
  );
};

export default Intro;
