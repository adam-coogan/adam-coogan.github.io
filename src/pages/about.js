import { StaticImage } from "gatsby-plugin-image";
import React from "react";
import Layout from "../components/layout";

const About = () => {
  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <StaticImage
          src="../images/adam-switzerland.jpeg"
          alt="Me in the Swiss Alps"
          placeholder="blurred"
          layout="fixed"
          width={500}
          style={{ textAlign: "center" }}
        />
      </div>
      <p>
        I am currently a postdoctoral researcher at the GRAPPA institute at the
        University of Amsterdam. I did my Ph.D. at the University of California,
        Santa Cruz between 2012 and 2018. Before that I was an undergraduate at
        Brown University in Providence, Rhode Island, where I received my Sc.B.
        in mathematical physics. I'm originally from Rhode Island and grew up a
        15 minute drive outside of Providence.
      </p>
      <p>
        Outside of physics, I like rock climbing (particularly bouldering),
        being outdoors, sailing, cooking lots of different types of food,
        learning languages and traveling.
      </p>
    </Layout>
  );
};

export default About;
