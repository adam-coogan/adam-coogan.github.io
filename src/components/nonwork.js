import React from "react";
import ColumnContainer from "./columncontainer";
import TextContainer from "./textcontainer";
import Image from "./image";
import Column from "./column";
import Buttermilks from "../images/red-rock.jpg";

const Text = () => (
  <TextContainer>
    <h1>Non-work</h1>
    <p>
      I like rock climbing, remote nature, cooking, traveling, sailing, learning
      languages, making and seeing art, and building digital and physical
      things.
    </p>
    <p>
      I took all the photos on this site except the one of me, which Laura took.
      I made this site with her help.
    </p>
  </TextContainer>
);

const NonWork = () => {
  return (
    <ColumnContainer>
      <Column>
        <Image src={Buttermilks} />
      </Column>
      <Column>
        <Text />
      </Column>
    </ColumnContainer>
  );
};

export default NonWork;
