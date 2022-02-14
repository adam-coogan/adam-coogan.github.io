import React, { useState } from "react";
import ReactTooltip from "react-tooltip";
import Layout from "../components/layout";
import ImageCanvas from "../components/lensing/imagecanvas";
import LensControls from "../components/lensing/lenscontrols";
import ShearControls from "../components/lensing/shearcontrols";
import SHPopControls from "../components/lensing/shpopcontrols";
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
import { getNoiseTexArray, getNPix, sampleSHParams } from "../utils/utils";

/*
 * Generate images with a population of 50 subhalos.
 */

const N_SH = 50;
const fsLensSource = getFSLensSource(N_SH);

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
  const x_l = 0.0;
  const y_l = 0.0;
  const [phi_lDeg, setPhilDeg] = useState(57.296);
  const [q_l, setQl] = useState(0.75);
  const [r_ein, setRein] = useState(1.5);
  const [lensLightScale, setLensLightScale] = useState(INIT_LENS_LIGHT_SCALE);
  // Shear parameters
  const [gamma_1, setGamma_1] = useState(0.007);
  const [gamma_2, setGamma_2] = useState(0.01);
  // Subhalo parameters
  const [shParams, setSHParams] = useState(sampleSHParams(N_SH));
  const [hideSHs, setHideSHs] = useState(true);
  // Telescope parameters
  const [res, setRes] = useState(0.1);
  const [sigma_n, setSigmaN] = useState(0.5);
  // Final flux scale
  const lowFlux = -3;
  const highFlux = lensLightScale === 0 ? 23 : INIT_LENS_LIGHT_SCALE;
  const lowFluxSrc = lowFlux;
  const highFluxSrc = highFlux;
  // Intermediate flux scale
  const maxFlux = highFlux;
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
      <div style={{ backgroundColor: "#FFFFFF" }}>
        <div id="intro">
          <h1>Probing dark matter with strong gravitational lensing</h1>
          <p>
            From observations of the motion of galaxies and the large-scale
            structure of the universe, we know that 85% of the matter in the
            universe and average galaxy is <b>dark</b>. But beyond its abundance
            and distribution on large scales, the details about what dark matter
            actually <i>is</i> are murky.
          </p>
          <p>
            The mysteries about dark matter's composition are connect to our
            lack of knowledge of dark matter's distribution on small scales,
            where "small" means "smaller than a galaxy". Our best guess is that
            dark matter is slow-moving, heavy and doesn't interact with itself
            (or anything else). This translates into every galaxy containing a
            large number of small dark matter clumps, with many more light
            clumps than heavy ones. If our best guess about dark matter is
            wrong, this picture will be altered. If instead the dark matter is
            fast-moving, light or interacting, far fewer small dark matter
            clumps will form.
          </p>
          <p>
            These dark matter clumps (dubbed <i>subhalos</i> by astrophysicists)
            are <b>dark</b>, which makes their presence hard to confirm or rule
            out. Enter <ins>strong gravitational lensing</ins>: an effect where
            the light from a distant galaxy is distorted by the mass of another
            galaxy, producing distorted ring-shaped images. The first of these
            rare systems was discovered in the late 1970s. In the intervening
            decades, strong lensing has morphed from a curious consequence of
            Einstein's theory of general relativity to a powerful tool for
            understanding the universe.
          </p>
          <p>
            Read on to learn about strong lensing and how physicists use it to
            probe the fundamental nature of dark matter.
          </p>
        </div>
        <div id="source-galaxy">
          <h2>The source galaxy</h2>
          <p>
            The galaxy whose light emission is distorted in a strong lensing
            system is called the <i>source</i>. Galaxies come in many different
            shapes and sizes, but to first approximation they 
          </p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            minHeight: "94vh",
            width: "1040px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "920px" }}>
            <p>
              This visualization lets you explore how changing the source
              galaxy, lens galaxy, telescope and subhalo parameters impacts an
              observation of a strong gravitational lens.
            </p>
          </div>
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
                paddingRight: "40px",
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
                  lowFlux={lowFluxSrc}
                  highFlux={highFluxSrc}
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
                paddingLeft: "40px",
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
                  x_sh={shParams.x_shs}
                  y_sh={shParams.y_shs}
                  M_200c={shParams.M_200cs}
                  tau={new Array(N_SH).fill(TAU)}
                  hideSHs={hideSHs}
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
              <SHPopControls
                resampleSHs={() => setSHParams(sampleSHParams(N_SH))}
                hideSHs={hideSHs}
                toggleHideSHs={() =>
                  hideSHs ? setHideSHs(false) : setHideSHs(true)
                }
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
      </div>
    </Layout>
  );
};

export default Page;
