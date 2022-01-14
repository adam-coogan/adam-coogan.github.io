import React, { useState } from "react";
import ReactTooltip from "react-tooltip";
import Layout from "../components/layout";
import ImageCanvas from "../components/lensing/imagecanvas";
import LensControls from "../components/lensing/lenscontrols";
import SHControls from "../components/lensing/shcontrols";
import ShearControls from "../components/lensing/shearcontrols";
import SourceCanvas from "../components/lensing/sourcecanvas";
import SourceControls from "../components/lensing/sourcecontrols";
import TelescopeControls from "../components/lensing/telescopecontrols";
import {
  EUCLID_RES,
  INIT_LENS_LIGHT_SCALE,
  TARGET_RANGE,
  TAU,
  UPSAMPLE,
} from "../utils/constants";
import { getFSLensSource } from "../utils/shaders";
import { getNoiseTexArray, getNPix } from "../utils/utils";

// Other constants
const fsLensSource = getFSLensSource(1);

const Page = () => {
  // Source parameters
  const [x_s, setXs] = useState(0.05);
  const [y_s, setYs] = useState(EUCLID_RES);
  const [phi_sDeg, setPhisDeg] = useState(40.107);
  const [q_s, setQs] = useState(0.5);
  const [index, setIndex] = useState(4.0);
  const [r_e, setRe] = useState(5.0);
  const I_e = 0.05;
  // Main lens parameters
  const x_l = 0.0; // const [x_l, setXl] = useState(0.0);
  const y_l = 0.0; // const [y_l, setYl] = useState(0.0);
  const [phi_lDeg, setPhilDeg] = useState(57.296);
  const [q_l, setQl] = useState(0.75);
  const [r_ein, setRein] = useState(1.5);
  const [lensLightScale, setLensLightScale] = useState(INIT_LENS_LIGHT_SCALE);
  // Shear parameters
  const [gamma_1, setGamma_1] = useState(0.007);
  const [gamma_2, setGamma_2] = useState(0.01);
  // Subhalo parameters
  const [x_sh, setXsh] = useState(-1.1);
  const [y_sh, setYsh] = useState(-1.1);
  const [M_200c, setM200c] = useState(1e10);
  // Telescope parameters
  const [res, setRes] = useState(0.1);
  const [sigma_n, setSigmaN] = useState(0.5);
  // Final flux scale
  const lowFlux = -3;
  const highFlux = lensLightScale === 0 ? 23 : INIT_LENS_LIGHT_SCALE;
  // Intermediate flux scale
  const maxFlux = highFlux; // TODO: figure out how to reduce flux quantization... :[
  // Image constants
  const canvasDim = 400; // final canvas size
  const nPix = getNPix(canvasDim, TARGET_RANGE, res); // final size in pixels
  const range = (nPix * res) / 2; // arcsec
  const nPixFine = UPSAMPLE * nPix; // fine grid pixel size
  // Noise
  const noiseRange = 5;
  const [noiseArray, setNoiseArray] = useState(
    getNoiseTexArray(nPix ** 2, noiseRange)
  );

  return (
    <Layout>
      <div
        style={{
          backgroundColor: "#FFFFFF",
          minHeight: "94vh",
        }}
      >
        {/*        <p>
          This visualization lets you explore how changing the source galaxy,
          lens galaxy, telescope and subhalo parameters impacts an observation
          of a strong gravitational lens.
        </p>*/}
        <div
          style={{
            justifyContent: "center",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div
            style={{
              width: canvasDim,
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
              padding: "0.5rem",
              paddingRight: "5rem",
            }}
          >
            <div>
              <h2 data-tip data-for="sourceHeaderTT">
                Source
              </h2>
              <ReactTooltip id="sourceHeaderTT">
                Source galaxy with no lensing
              </ReactTooltip>
              <SourceCanvas
                x_s={x_s}
                y_s={y_s}
                phi_sDeg={phi_sDeg}
                q_s={q_s}
                index={index}
                r_e={r_e}
                I_e={I_e}
                lowFlux={lowFlux}
                highFlux={highFlux}
                range={range}
                canvasDim={canvasDim}
              />
            </div>
            <SourceControls
              x={x_s}
              y={y_s}
              phiDeg={phi_sDeg}
              q={q_s}
              index={index}
              r_e={r_e}
              setX={setXs}
              setY={setYs}
              setPhiDeg={setPhisDeg}
              setQ={setQs}
              setIndex={setIndex}
              setRe={setRe}
            />
            <TelescopeControls
              sigma_n={sigma_n}
              setSigmaN={setSigmaN}
              setRes={(res: number) => {
                setRes(res);
                const newNPix = getNPix(canvasDim, TARGET_RANGE, res);
                setNoiseArray(getNoiseTexArray(newNPix ** 2, noiseRange));
              }}
              resampleNoise={() =>
                setNoiseArray(getNoiseTexArray(nPix ** 2, noiseRange))
              }
            />
          </div>
          <div
            style={{
              width: canvasDim,
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
              padding: "0.5rem",
              paddingLeft: "5rem",
            }}
          >
            <div>
              <h2 data-tip data-for="obsHeaderTT">
                Observation
              </h2>
              <ReactTooltip id="obsHeaderTT">
                Observation of lensed galaxy seen by telescope
              </ReactTooltip>
              <ImageCanvas
                fsLensSource={fsLensSource}
                // Source parameters
                x_s={x_s}
                y_s={y_s}
                phi_sDeg={phi_sDeg}
                q_s={q_s}
                index={index}
                r_e={r_e}
                I_e={I_e}
                // Main lens parameters
                x_l={x_l}
                y_l={y_l}
                phi_lDeg={phi_lDeg}
                q_l={q_l}
                r_ein={r_ein}
                lensLightScale={lensLightScale}
                // External shear parameters
                gamma_1={gamma_1}
                gamma_2={gamma_2}
                // Subhalo parameters
                x_sh={[x_sh]}
                y_sh={[y_sh]}
                M_200c={[M_200c]}
                tau={[TAU]}
                // Misc parameters
                noiseArray={noiseArray}
                noiseRange={noiseRange}
                sigma_n={sigma_n}
                maxFlux={maxFlux}
                lowFlux={lowFlux}
                highFlux={highFlux}
                res={res}
                nPix={nPix}
                nPixFine={nPixFine}
                range={range}
                canvasDim={canvasDim}
              />
            </div>
            <SHControls
              x={x_sh}
              y={y_sh}
              M_200c={M_200c}
              setX={setXsh}
              setY={setYsh}
              setM200c={setM200c}
              // setc200c={setc200c}
              // setTau={setTau}
            />
            <LensControls
              phiDeg={phi_lDeg}
              q={q_l}
              r_ein={r_ein}
              lensLight={lensLightScale !== 0.0}
              setPhiDeg={setPhilDeg}
              setQ={setQl}
              setRein={setRein}
              toggleLensLight={() =>
                lensLightScale === 0.0
                  ? setLensLightScale(INIT_LENS_LIGHT_SCALE)
                  : setLensLightScale(0.0)
              }
            />
            <ShearControls
              gamma_1={gamma_1}
              gamma_2={gamma_2}
              setGamma_1={setGamma_1}
              setGamma_2={setGamma_2}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Page;
