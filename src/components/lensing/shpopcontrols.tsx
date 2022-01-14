import React from "React";
import Button from "./button";

const SHPopControls = ({ resampleSHs }) => (
  <div>
    <h2>Subhalo parameters</h2>
    <Button onClick={() => resampleSHs()}>Resample subhalos</Button>
  </div>
);

export default SHPopControls;
