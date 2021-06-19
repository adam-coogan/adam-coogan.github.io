import { Link } from "gatsby";
import React from "react";
import Layout from "../components/layout";

const Code = () => {
  return (
    <Layout>
      <p>
        I think that part of doing good science is writing and sharing good
        code. Here are some repositories which I've written or to which I've
        contributed significantly, as well as some personal projects. Check out
        my <Link to="/research/">Research</Link> page for code associated with
        specific physics papers.
      </p>
      <ul>
        <li>
          <span role="img" aria-label="lightning bolt">
            ⚡️
          </span>{" "}
          <a href="https://github.com/LoganAMorrison/Hazma">Hazma</a>: a python
          toolkit for computing indirect detection constraints on dark matter
          models producing MeV-scale gamma rays. Based on my PhD work, written
          in close collaboration with{" "}
          <a href="https://github.com/LoganAMorrison">Logan Morrison</a>, and
          used for <a href="https://arxiv.org/abs/1907.11846">several</a>{" "}
          <a href="https://arxiv.org/abs/2010.04797">of</a>{" "}
          <a href="https://arxiv.org/abs/2101.10370">our</a>{" "}
          <a href="https://arxiv.org/abs/2104.06168">papers</a>.
        </li>
        <li>
          <span role="img" aria-label="compass">
            🧭
          </span>{" "}
          <a href="https://github.com/adam-coogan/diffjeom">diffjeom</a>: a
          python package for differential geometry. Given a function defining
          the metric tensor for a manifold, this package uses the magic of{" "}
          <a href="https://en.wikipedia.org/wiki/Automatic_differentiation">
            automatic differentiation
          </a>{" "}
          and the <a href="https://github.com/google/jax">jax</a> package to
          rapidly compute its Christoffel symbols, scalar curvature, and all
          their friends.
        </li>
        <li>
          <span role="img" aria-label="graph">
            📈
          </span>{" "}
          <a href="https://github.com/adam-coogan/jaxinterp2d">jaxinterp2d</a>:
          simple bilinear interpolation on regular grids with{" "}
          <a href="https://github.com/google/jax">jax</a>. I wrote this to get
          around jax not yet having hypergeometric functions.
        </li>
        <li>
          <span role="img" aria-label="frying pan">
            🍳
          </span>{" "}
          <a href="https://tasty-base.web.app/">Tasty Base</a>: a react +
          firebase web app for keeping track of your recipes and finding new
          cooking inspiration. Kind of a cross between an old-fashioned recipe
          notebook and Pinterest. Co-created with my partner Laura Henn, who is
          a web developer, this was my first foray into the field. Source code
          available <a href="https://github.com/lhenn/tasty-base">here</a>.
        </li>
      </ul>
    </Layout>
  );
};

export default Code;
