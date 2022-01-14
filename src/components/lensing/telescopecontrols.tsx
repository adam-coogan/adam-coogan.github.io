import React, { useState } from "react";
import {
  ELT_RES,
  EUCLID_RES,
  HST_RES,
  JWST_RES,
  RUBIN_RES,
} from "../../utils/constants";
import Button from "./button";
import ChangeResButton from "./changeresbutton";
import ParamControls from "./paramcontrols";

const TelescopeControls = ({ sigma_n, setSigmaN, setRes, resampleNoise }) => {
  const [activeID, setActiveID] = useState("euclid");

  return (
    <div>
      <h2>Telescope</h2>
      <ParamControls
        label="Noise level"
        value={sigma_n}
        set={setSigmaN}
        min={0}
        max={3.0}
        description="Scale of telescope noise level"
      />
      <Button onClick={() => resampleNoise()}>Resample noise</Button>
      <div>
        <ChangeResButton
          label="ELT"
          id="elt"
          resolution={ELT_RES}
          setRes={setRes}
          activeID={activeID}
          setActiveID={setActiveID}
          description="Extremely Large Telescope, 0.004-0.012'' pixel size"
        />
        <ChangeResButton
          label="JWST"
          id="jwst"
          resolution={JWST_RES}
          setRes={setRes}
          activeID={activeID}
          setActiveID={setActiveID}
          description="James Webb Space Telescope, 0.031'' pixel size"
        />
        <ChangeResButton
          label="Hubble Space Telescope"
          id="hst"
          resolution={HST_RES}
          setRes={setRes}
          activeID={activeID}
          setActiveID={setActiveID}
          description="0.05'' pixel size"
        />
        <ChangeResButton
          label="Euclid"
          id="euclid"
          resolution={EUCLID_RES}
          setRes={setRes}
          activeID={activeID}
          setActiveID={setActiveID}
          description="0.1'' pixel size"
        />
        <ChangeResButton
          label="Rubin Observatory"
          id="rubin"
          resolution={RUBIN_RES}
          setRes={setRes}
          activeID={activeID}
          setActiveID={setActiveID}
          description="0.7'' seeing"
        />
      </div>
    </div>
  );
  // DEBUG
  // <button style={{ margin: "0.1rem" }} onClick={() => setRes(1.25)}>
  //   Chunky
  // </button>
};

export default TelescopeControls;
