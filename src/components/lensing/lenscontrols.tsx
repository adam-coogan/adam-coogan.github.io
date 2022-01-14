import React from "react";
import Button from "./button";
import ParamControls from "./paramcontrols";

const LensControls = ({
  phiDeg,
  q,
  r_ein,
  lensLight,
  setPhiDeg,
  setQ,
  setRein,
  toggleLensLight,
}) => (
  <div>
    <h2>Lens parameters</h2>
    <ParamControls
      label="Orientation"
      value={phiDeg}
      set={setPhiDeg}
      min={-180}
      max={180}
      description="Orientation of lens relative to x-axis"
    />
    <ParamControls
      label="Ellipticity"
      value={q}
      set={setQ}
      min={0.15}
      max={0.9999}
      description="Controls whether lens is circular (q=1) or elliptical (q=0)"
    />
    <ParamControls
      label="Einstein radius"
      value={r_ein}
      set={setRein}
      min={0.0001}
      max={2.5}
      description="Sets the size of the lens"
    />
    <Button selected={lensLight} onClick={toggleLensLight}>
      {lensLight ? "Turn off lens light" : "Turn on lens light"}
    </Button>
  </div>
);

export default LensControls;
