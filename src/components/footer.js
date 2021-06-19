import "@fontsource/open-sans/300.css"; // Defaults to weight 400 with all styles included.
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Obfuscate from "react-obfuscate";

const Footer = () => {
  return (
    <footer style={{ float: "left" }}>
      <ul style={{ margin: "0", padding: "0" }}>
        <li style={{ display: "inline", paddingRight: "1rem" }}>
          <FontAwesomeIcon icon={faEnvelope} />{" "}
          <Obfuscate email="a.m.coogan@uva.nl" />
        </li>

        <li style={{ display: "inline" }}>
          <FontAwesomeIcon icon={faGithub} />{" "}
          <a href={`https://github.com/adam-coogan`}>adam-coogan</a>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
