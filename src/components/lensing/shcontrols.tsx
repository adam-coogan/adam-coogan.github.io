import React from "react";
import ParamControls from "./paramcontrols";

const SHControls = ({ x, y, M_200c, setX, setY, setM200c }) => (
  <div>
    <h2>Subhalo parameters</h2>
    <ParamControls
      label="Horizontal position"
      value={x}
      set={setX}
      min={-2.5}
      max={2.5}
    />
    <ParamControls
      label="Vertical position"
      value={y}
      set={setY}
      min={-2.5}
      max={2.5}
    />
    <ParamControls
      label="Mass"
      value={Math.log10(M_200c)}
      set={(newVal: number) => setM200c(10 ** newVal)}
      min={5}
      max={10.5}
      description={
        "The mass is that of a sphere centered on the subhalo in " +
        "which the average density is 200 times rho_cr"
      }
    />
  </div>
);

export default SHControls;
