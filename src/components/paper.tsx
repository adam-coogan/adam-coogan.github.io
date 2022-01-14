import React from "react";

const Paper = ({ title, authors, journal, arxiv, tags }) => {
  return (
    <p>
      <strong>{title}</strong>
      <br />
      {authors.join(", ")}
      <br />
      {journal ? journal + " · " : ""}[
      <a href={`https://arxiv.org/abs/${arxiv}`} style={{ color: "black" }}>
        arXiv
      </a>
      ]
      <br />
      <i style={{ color: "#f45b2b" }}>
        {tags.map((t: string) => "#" + t).join(" ")}
      </i>
    </p>
  );
};

export default Paper;
