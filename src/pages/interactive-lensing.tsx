import React, { useState } from "react";
import ReactTooltip from "react-tooltip";
import Layout from "../components/layout";
import Horseshoe from "../components/horseshoe";
import CDMGalaxy from "../components/cdmgalaxy";
import WDMGalaxy from "../components/wdmgalaxy";
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
  const padding = 40;
  const canvasDim = 400; // final canvas size
  const nPix = getNPix(canvasDim, TARGET_RANGE, res); // final size in pixels
  const range = (nPix * res) / 2; // arcsec
  const nPixFine = UPSAMPLE * nPix; // fine grid pixel size
  // Noise
  const noiseRange = 5;
  const [noiseArray, setNoiseArray] = useState(
    getNoiseTexArray(nPix ** 2, noiseRange)
  );

  const intro = (
    <div
      id="intro"
      style={{
        width: `${2 * canvasDim}px`,
        margin: "auto",
        paddingBottom: `${padding / 2}px`,
      }}
    >
      <h1>What's this all about?</h1>
      <p>
        A range of observations on galactic through cosmological scales demand
        the existence of <b>dark matter</b>, which outweighs normal matter by
        4:1. But beyond its abundance and distribution on large scales, the
        identity of the fundamental constituents of dark matter remains unknown.
      </p>
      <p>
        The fundamental properties of dark matter are closely connected with how
        it is distributed on small scales. For example, the images below from
        this simulation visualize the dark matter in a galaxy assuming it is{" "}
        <b>cold</b>
        (i.e. heavy and slow-moving, left plot) or warm (i.e. light and
        fast-moving, right plot). The difference is striking: if dark matter is
        warm, galaxies should contain far fewer small structures (more properly
        called
        <a href="https://en.wikipedia.org/wiki/Dark_matter_halo">
          <b>subhalos</b>
        </a>
        ) than if it is cold. The general lesson is that learning how dark
        matter is distributed on subgalactic scales tells us something about its
        fundamental properties.
      </p>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <CDMGalaxy /> <WDMGalaxy />
      </div>
      <p>
        Since small subhalos are made purely of dark matter, they don't emit
        light and are hard to search for. Instead, I use{" "}
        <a href="https://en.wikipedia.org/wiki/Gravitational_lens">
          <b>gravitational lensing</b>
        </a>{" "}
        to search for them.
      </p>
      <div style={{ display: "flex" }}>
        <div style={{ paddingRight: `${padding}px` }}>
          <p>
            To right is a Hubble Space Telescope image of the famous{" "}
            <a href="https://en.wikipedia.org/wiki/Cosmic_Horseshoe">
              Horseshoe lens
            </a>
            . The orange light is from the system's <i>lens</i> galaxy. The blue
            light comes from the <i>source</i> galaxy. The source is not really
            ring-shaped. Instead, it lies a good distance directly behind the
            lens, whose gravitational field dramatically distorts the source's
            light.
          </p>
          <p>
            The lens galaxy consists of a large amount of dark matter, stars,
            dust and gas, and the ring-shaped distortion it produces is
            immediately apparent. However, the gravitational distortions caused
            by dark matter subhalos located in the lens are far more subtle.
            Measuring their distortions requires precision statistical analysis.
          </p>
        </div>
        <Horseshoe style={{ minWidth: "250px" }} />
      </div>
      <p>
        <b>
          I use machine learning and statistics to detect and measure the
          distortions from subhalos in lenses
        </b>
        . The visualization below will give you a sense of why this is a
        difficult problem. The left image shows a simple model for what the
        light could look like from an undistorted source galaxy. The image on
        the right shows what a telescope would see: the distorted ring of light
        from the source, plus the light from the lens. Some things to explore:
      </p>
      <ul>
        <li>
          Click the "Resample subhalos" button to see how small the distortions
          from subhalos are. The variations between images with different
          subhalo populations can be quite small! Where in the observation are
          the differences most apparent? (Click "Show subhalos" if you want to
          see wherre the subhalos are located.)
        </li>
        <li>
          Change the sliders controlling the source, lens and shear parameters
          to see how they impact the observation. Can you find configurations
          where the subhalos' distortions are more apparent?
        </li>
        <li>
          Upcoming telescopes like the Extremely Large Telescope (ELT) and James
          Webb Space Telescope (JWST) will have much higher resolution than the
          Hubble Space Telescope. What impact does that have on how easy it is
          to see distortions from subhalos?
        </li>
        <li>
          Longer telescope observations reduce the noise in the observation. How
          does this help make the effects of subhalos more apparent?
        </li>
        <li>
          If you want to hide the light from the lens galaxy to make the
          distorted source galaxy easier to see, click "Turn off lens light".
          Subtracting this light from observations is typically the first stage
          in the data analysis.
        </li>
      </ul>
    </div>
  );
  const sourceColumn = (
    <div
      style={{
        width: canvasDim,
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        paddingRight: `${padding}px`,
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
  );

  const obsColumn = (
    <div
      style={{
        width: canvasDim,
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        paddingLeft: `${padding}px`,
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
        toggleHideSHs={() => (hideSHs ? setHideSHs(false) : setHideSHs(true))}
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
  );

  const visualization = (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      {sourceColumn}
      {obsColumn}
    </div>
  );

  return (
    <Layout>
      <div style={{ backgroundColor: "#232323" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            width: `${2 * (canvasDim + padding)}px`,
            padding: `${1.5 * padding}px`,
            margin: "auto",
          }}
        >
          <h1>Probing dark matter with strong gravitational lensing</h1>
          {visualization}
          <br/>
          <hr />
          {intro}
        </div>
      </div>
    </Layout>
  );
};

export default Page;
