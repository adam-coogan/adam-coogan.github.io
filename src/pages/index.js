import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "gatsby"
import React from "react"
import Obfuscate from "react-obfuscate"

const Home = () => {
  return (
    <div>
      <h1>Hi, I'm Adam Coogan.</h1>
      <Link to="/about/">About me</Link>
      <br />
      <Link to="/research/">Research</Link>
      <br />
      <Link to="/code/">Code</Link>
      <br />
      <Link to="/cv/">CV</Link>
      <br />
      <p>This is my website.</p>
      <br />
      <div>
        <FontAwesomeIcon icon={faEnvelope} />{" "}
        <Obfuscate email="a.m.coogan@uva.nl" />
      </div>
      <br />
      <div>
        <FontAwesomeIcon icon={faGithub} />{" "}
        <a href={`https://github.com/adam-coogan`}>adam-coogan</a>
      </div>
    </div>
  )
}

export default Home
