import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

// <Obfuscate email="a.m.coogan@uva.nl" />
const Email = () => (
  <a href="mailto:a.m.coogan@uva.nl" style={{ color: "white", margin: "10px"}}>
    <FontAwesomeIcon icon={faEnvelope} />
  </a>
);

export default Email;
