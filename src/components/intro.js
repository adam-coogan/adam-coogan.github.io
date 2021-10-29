import React from "react";
import styled from "styled-components";
import ColumnContainer from "./columncontainer";
import Column from "./column";
import TextContainer from "./textcontainer";
import DefaultImage from "./image";
import Me from "../images/adam-switzerland.jpg";

const Image = styled(DefaultImage)`
  @media (max-width: 750px) {
    min-height: 600px;
  }
`;

const Text = () => (
  <TextContainer>
    <h1>Hello, I'm Adam Coogan.</h1>
    <p>
      I'm a physicist searching for dark matter in astrophysical systems by
      creating new statistical machine learning analyses and improving our
      physics models.
    </p>
    <p>
      I am currently a postdoc at the{" "}
      <a href="https://phys.umontreal.ca/english/home/">
        Université de Montréal
      </a>{" "}
      and <a href="https://mila.quebec/en/">Mila</a>, the Quebec AI Institute.
      Previously I was a postdoc at <a href="http://grappa.amsterdam">GRAPPA</a>{" "}
      , an institute in the University of Amsterdam. I did my PhD at UC Santa
      Cruz and my ScB at Brown University.
    </p>
  </TextContainer>
);

const Intro = () => {
  return (
    <ColumnContainer>
      <Column>
        <Image src={Me} />
      </Column>
      <Column>
        <Text />
      </Column>
    </ColumnContainer>
  );
};

export default Intro;
