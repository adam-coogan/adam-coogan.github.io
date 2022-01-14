import React from "react";
import ParamControls from "./paramcontrols";

const ShearControls = ({ gamma_1, gamma_2, setGamma_1, setGamma_2 }) => (
  <div>
    <h2>External shear parameters</h2>
    <ParamControls
      label="Horizontal component"
      value={gamma_1}
      set={setGamma_1}
      min={-0.05}
      max={0.05}
      description="Horizontal component of distortions from large-scale structure"
    />
    <ParamControls
      label="Vertical component"
      value={gamma_2}
      set={setGamma_2}
      min={-0.05}
      max={0.05}
      description="Vertical component of distortions from large-scale structure"
    />
  </div>
);

export default ShearControls;
