import React from "react";
import Button from "./button";

const SHPopControls = ({ resampleSHs, hideSHs, toggleHideSHs }) => (
  <div>
    <h2>Subhalo parameters</h2>
    <Button onClick={() => resampleSHs()}>Resample subhalos</Button>
    <Button onClick={() => toggleHideSHs()} selected={!hideSHs}>
      {hideSHs ? "Show subhalos" : "Hide subhalos"}
    </Button>
  </div>
);

export default SHPopControls;
