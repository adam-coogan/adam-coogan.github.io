import { StaticImage } from "gatsby-plugin-image";
import React from "react";
import Layout from "../components/layout";
import styled from "styled-components";

const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Home = () => {
  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        <Column>
          <StaticImage
            src="../images/adam-switzerland.jpeg"
            alt="Me in the Swiss Alps"
            placeholder="blurred"
            layout="fixed"
            width={720}
            style={{ textAlign: "center" }}
          />
        </Column>
        <Column>
          <div style={{ width: "80%" }}>
            <h1>Hello, I'm Adam Coogan.</h1>
            <p>
              I'm a physicist interested in finding dark matter using a variety
              of astrophysical observations. I do this by unlocking new ways to
              analyze complex data using machine learning and statistics and by
              developing better physics models.
            </p>
            <p>
              I am currently a postdoc at the{" "}
              <a href="http://grappa.amsterdam">GRAPPA institute</a> at the
              University of Amsterdam. I will be joining the cosmology and
              machine learning group at{" "}
              <a href="https://phys.umontreal.ca/english/home/">
                Université de Montréal
              </a>{" "}
              and <a href="https://mila.quebec/en/">Mila</a> in fall 2021.
              Before my current position, I did my PhD at UC Santa Cruz. Prior
              to that I was an undergraduate at Brown University.
            </p>
          </div>
        </Column>
      </div>
    </Layout>
  );
};

export default Home;
