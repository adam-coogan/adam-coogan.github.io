import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const Github = () => (
  <a href={`https://github.com/adam-coogan`} style={{color: "white", margin: "10px"}}>
    <FontAwesomeIcon icon={faGithub} />
  </a>
);

export default Github;
