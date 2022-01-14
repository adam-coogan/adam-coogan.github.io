import React, { useEffect, useRef, useState } from "react";
import Layout from "../components/layout";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import * as twgl from "twgl.js"; // weird import structure
import {
  fsLensSource,
  getFSPost,
  vsSource,
  fsSrcSource,
} from "../utils/shaders";
import { virialToScale } from "../utils/tnfwwebgl";
import { randn } from "../utils/utils";

/*
 * The plan
 * --------
 * -[ ] What direction do I want to take this thing?
 *      * Explain why gravitational lensing lets us detect subhalos by showing
 *        residual wrt smooth lens model
 *      * Emphasize that signal is small. Maybe make the noise toggle instead
 *        of making it variable? That would show the impact of improving the
 *        telescope resolution.
 *      * Show population of ≤50 subhalos -- more than that slows things down.
 * -[X] Switch to twgl
 * -[X] Style resolution buttons
 * -[X] Add subhalo
 * -[X] Show subhalo dot
 * -[X] Show lens ellipse
 * -[X] Figure out how to show source
 * -[X] Add external shear
 * -[X] Add lens light
 *      * Can add another canvas with a similar shader to the source one
 *      * Need to use a different color scheme, blending and transparency
 *      * Unclear how to map r_ein to r_e and what flux scale to use. Could use
 *        mass-to-light ratio?
 * -[ ] Add subhalo population
 * -[ ] Generate subhalo shader with constants matching tsx
 * -[?] Visualize subhalo's impact. Maybe show difference between images with
 *      and without subhalo?
 * -[?] Separate initialization and drawing steps
 */

// Generate post-processesing shader
const UPSAMPLE = 4;
const fsPostSource = getFSPost(UPSAMPLE);
// Telescope resolutions
const eltRes = 0.012;
const jwstRes = 0.031;
const hstRes = 0.05;
const euclidRes = 0.1;
const rubinRes = 0.7;
// Other constants
const TARGET_RANGE = 2.5; // arcsec
const INIT_LENS_LIGHT_SCALE = 60.0;
const N_SH = 50;
const M_SH_MIN = 1e8; // MSUN
const M_SH_MAX = 1e10; // MSUN

const sampleSHParams = (n: number) => {
  const x_shs = Array.from(
    { length: n },
    () => 2 * TARGET_RANGE * (Math.random() - 0.5)
  );
  const y_shs = Array.from(
    { length: n },
    () => 2 * TARGET_RANGE * (Math.random() - 0.5)
  );
  // Sample from bounded Pareto distribution with alpha = 1 (p(M) ~ 1 / M**2)
  const M_200cs = Array.from({ length: n }, () => {
    const u = Math.random();
    return (
      (-(u * M_SH_MAX - u * M_SH_MIN - M_SH_MAX) / (M_SH_MAX * M_SH_MIN)) **
      (-1 / 1)
    );
  });
  return { x_shs, y_shs, M_200cs };
};

const Button = styled.button`
  background-color: ${({ selected }) => (selected ? "#6c757d" : "#ffffff")};
  border-color: ${({ selected }) => (selected ? "#ffffff" : "#6c757d")};
  color: ${({ selected }) => (selected ? "#ffffff" : "#6c757d")};
  margin: 0.2em;
  padding: 0.5em 1em;
  border: 2px solid;
  border-radius: 4px;
  &:hover {
    background-color: #a6acb1;
    border-color: #ffffff;
    color: #ffffff;
  }
  &:active {
    background-color: #6c757d;
    border-color: #ffffff;
    color: #ffffff;
  }
`;

const useCanvas = (ctxName: string, draw: (gl: RenderingContext) => void) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext(ctxName);
    if (!ctx) console.log(`no ${ctxName}!`);
    draw(ctx);
  }, [draw]);

  return canvasRef;
};

interface CanvasProps {
  ctxName: string;
  draw: (gl: RenderingContext) => void;
  [rest: string]: any;
}

const Canvas = (props: CanvasProps) => {
  const { ctxName, draw, ...rest } = props;
  const canvasRef = useCanvas(ctxName, draw);
  return <canvas ref={canvasRef} {...rest} />;
};

interface ParamControlsProps {
  label: string;
  value: number;
  set: (newVal: number) => void;
  min: number;
  max: number;
  description?: string;
}

const ParamControls = ({
  label,
  value,
  set,
  min,
  max,
  description,
}: ParamControlsProps) => {
  const labelBlock = description ? (
    <>
      <label
        style={{ flex: 2, margin: "0.2rem" }}
        data-tip
        data-for={description}
      >
        {label}
      </label>
      <ReactTooltip id={description}>{description}</ReactTooltip>{" "}
    </>
  ) : (
    <label style={{ flex: 2, margin: "0.2rem" }}>{label}</label>
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      {labelBlock}
      {/*      <input
        style={{ flex: 1, margin: "0.2rem", minWidth: 0 }}
        type="text"
        min={min}
        max={max}
        step={0.001}
        value={value}
        onChange={(e) => {
          set(parseFloat(e.target.value));
        }}
      />*/}
      <input
        style={{ flex: 2.5, margin: "0.2rem" }}
        type="range"
        min={min}
        max={max}
        step={0.001}
        value={value}
        onChange={(e) => set(parseFloat(e.target.value))}
      />
    </div>
  );
};

const SourceControls = ({
  x,
  y,
  phiDeg,
  q,
  index,
  r_e,
  setX,
  setY,
  setPhiDeg,
  setQ,
  setIndex,
  setRe,
}) => (
  <div>
    <h2>Source parameters</h2>
    <ParamControls
      label="Horizontal position"
      value={x}
      set={setX}
      min={-TARGET_RANGE}
      max={TARGET_RANGE}
    />
    <ParamControls
      label="Vertical position"
      value={y}
      set={setY}
      min={-TARGET_RANGE}
      max={TARGET_RANGE}
    />
    <ParamControls
      label="Orientation"
      value={phiDeg}
      set={setPhiDeg}
      min={-180}
      max={180}
      description="Orientation of source relative to x-axis"
    />
    <ParamControls
      label="Ellipticity"
      value={q}
      set={setQ}
      min={0.15}
      max={0.9999}
      description="Controls whether source is circular (q=1) or elliptical (q=0)"
    />
    <ParamControls
      label="Sharpness"
      value={index}
      set={setIndex}
      min={0.5}
      max={5}
      description="Higher values cause source brightness to decrease sharply with radius"
    />
    <ParamControls
      label="Size"
      value={r_e}
      set={setRe}
      min={0.0001}
      max={10}
      description="Sets the size of the source"
    />
  </div>
);

const LensControls = ({
  phiDeg,
  q,
  r_ein,
  lensLightScale,
  setPhiDeg,
  setQ,
  setRein,
  setLensLightScale,
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
      max={TARGET_RANGE}
      description="Sets the size of the lens"
    />
    <Button
      selected={lensLightScale === INIT_LENS_LIGHT_SCALE}
      onClick={() =>
        lensLightScale === 0.0
          ? setLensLightScale(INIT_LENS_LIGHT_SCALE)
          : setLensLightScale(0.0)
      }
    >
      {lensLightScale === 0 ? "Turn on lens light" : "Turn off lens light"}
    </Button>
  </div>
);

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

const SHControls = ({ resampleSHs }) => (
  <div>
    <h2>Subhalo parameters</h2>
    <Button onClick={() => resampleSHs()}>Resample subhalos</Button>
  </div>
);

const ChangeResButton = ({
  label,
  id,
  resolution,
  setRes,
  activeID,
  setActiveID,
  description,
}) => (
  <>
    <Button
      id={id}
      selected={id === activeID}
      onClick={() => {
        setActiveID(id);
        setRes(resolution);
      }}
      data-tip
      data-for={id}
    >
      {label}
    </Button>
    <ReactTooltip id={id}>{description}</ReactTooltip>
  </>
);

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
          resolution={eltRes}
          setRes={setRes}
          activeID={activeID}
          setActiveID={setActiveID}
          description="Extremely Large Telescope, 0.004-0.012'' pixel size"
        />
        <ChangeResButton
          label="JWST"
          id="jwst"
          resolution={jwstRes}
          setRes={setRes}
          activeID={activeID}
          setActiveID={setActiveID}
          description="James Webb Space Telescope, 0.031'' pixel size"
        />
        <ChangeResButton
          label="Hubble Space Telescope"
          id="hst"
          resolution={hstRes}
          setRes={setRes}
          activeID={activeID}
          setActiveID={setActiveID}
          description="0.05'' pixel size"
        />
        <ChangeResButton
          label="Euclid"
          id="euclid"
          resolution={euclidRes}
          setRes={setRes}
          activeID={activeID}
          setActiveID={setActiveID}
          description="0.1'' pixel size"
        />
        <ChangeResButton
          label="Rubin Observatory"
          id="rubin"
          resolution={rubinRes}
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

const getNoiseTexArray = (size: number, noiseRange: number) =>
  // Clamp to noise range, then rescale to [0, 1]
  Uint8Array.from({ length: size }, () =>
    Math.floor(
      (256 *
        (Math.max(-noiseRange, Math.min(noiseRange, randn())) + noiseRange)) /
        (2 * noiseRange)
    )
  );

const getNPix = (canvasDim: number, targetRange: number, res: number) =>
  Math.min(canvasDim, Math.ceil((2 * targetRange) / res));

const Page = () => {
  // Source parameters
  const [x_s, setXs] = useState(0.05);
  const [y_s, setYs] = useState(0.1);
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
  const [shParams, setSHParams] = useState(sampleSHParams(N_SH));
  const tau = 6.0;
  // Telescope parameters
  const [res, setRes] = useState(euclidRes);
  const [sigma_n, setSigmaN] = useState(0.5);
  // Final flux scale
  const lowFlux = -3;
  const highFlux = lensLightScale === 0 ? 23 : INIT_LENS_LIGHT_SCALE;
  const lowFluxSrc = lowFlux;
  const highFluxSrc = highFlux;
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

  // Convert from virial to scale subhalo parameters
  const rho_ss = new Array(N_SH);
  const r_ss = new Array(N_SH);
  for (let i = 0; i < N_SH; i++) {
    const { rho_s, r_s } = virialToScale(shParams.M_200cs[i]);
    rho_ss[i] = rho_s;
    r_ss[i] = r_s;
  }

  const drawSource = (gl: WebGLRenderingContext) => {
    const srcProgInfo = twgl.createProgramInfo(gl, [vsSource, fsSrcSource]);
    gl.useProgram(srcProgInfo.program);
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Set up quad positions
    const quadBufferInfo = twgl.createBufferInfoFromArrays(gl, {
      a_position: {
        size: 2,
        data: [-1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, -1],
      },
    });
    twgl.setBuffersAndAttributes(gl, srcProgInfo, quadBufferInfo);

    // Set source parameters
    const uniforms = {
      u_range: range,
      u_x_s: x_s,
      u_y_s: y_s,
      u_phi_s: (phi_sDeg * Math.PI) / 180,
      u_q_s: q_s,
      u_index: index,
      u_r_e: r_e,
      u_I_e: I_e,
      u_low_flux: lowFluxSrc,
      u_high_flux: highFluxSrc,
    };
    twgl.setUniforms(srcProgInfo, uniforms);
    // Draw
    twgl.drawBufferInfo(gl, quadBufferInfo);
  };

  const drawImage = (gl: WebGLRenderingContext) => {
    const lensProgInfo = twgl.createProgramInfo(gl, [vsSource, fsLensSource]);
    const postProgInfo = twgl.createProgramInfo(gl, [vsSource, fsPostSource]);

    // Set up quad positions
    const quadBufferInfo = twgl.createBufferInfoFromArrays(gl, {
      a_position: {
        size: 2,
        data: [-1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, -1],
      },
    });
    twgl.setBuffersAndAttributes(gl, lensProgInfo, quadBufferInfo);

    // Do the lensing
    gl.useProgram(lensProgInfo.program);
    // Set source parameters
    const lensUniforms = {
      // Source
      u_x_s: x_s,
      u_y_s: y_s,
      u_phi_s: (phi_sDeg * Math.PI) / 180,
      u_q_s: q_s,
      u_index: index,
      u_r_e: r_e,
      u_I_e: I_e,
      // Main lens
      u_x_l: x_l,
      u_y_l: y_l,
      u_phi_l: (phi_lDeg * Math.PI) / 180,
      u_q_l: q_l,
      u_r_ein: r_ein,
      u_lens_light_scale: lensLightScale,
      // Shear
      u_gamma_1: gamma_1,
      u_gamma_2: gamma_2,
      // Subhalo
      u_x_sh: shParams.x_shs,
      u_y_sh: shParams.y_shs,
      u_rho_s: rho_ss,
      u_r_s: r_ss,
      u_tau: new Array(N_SH).fill(tau),
      // Misc
      u_range: range,
      u_max_flux: maxFlux,
    };
    twgl.setUniforms(lensProgInfo, lensUniforms);
    // Create framebuffer texture for intermediate rendering
    console.assert(
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE,
      "framebuffer is not ready to display"
    );
    const fbFine = twgl.createFramebufferInfo(
      gl,
      [
        {
          min: gl.NEAREST,
          mag: gl.NEAREST,
          wrap: gl.CLAMP_TO_EDGE,
        },
      ],
      nPixFine,
      nPixFine
    );
    // Draw quad to framebuffer texture
    twgl.bindFramebufferInfo(gl, fbFine);
    twgl.drawBufferInfo(gl, quadBufferInfo);

    // Unbind framebuffer to switch to drawing to canvas
    twgl.bindFramebufferInfo(gl, null);
    gl.viewport(0, 0, nPix, nPix);

    // Apply PSF, pixelation and noise
    gl.useProgram(postProgInfo.program);
    // Create noise texture
    const noiseTex = twgl.createTexture(gl, {
      format: gl.LUMINANCE,
      min: gl.NEAREST,
      mag: gl.NEAREST,
      wrap: gl.CLAMP_TO_EDGE,
      width: nPix,
      height: nPix,
      src: noiseArray,
    });
    const postUniforms = {
      u_n_pix_fine: nPixFine,
      u_n_pix: nPix,
      u_noise_range: noiseRange,
      u_sigma_n: sigma_n,
      u_max_flux: maxFlux,
      u_low_flux: lowFlux,
      u_high_flux: highFlux,
      u_flux_tex: fbFine.attachments[0],
      u_noise_tex: noiseTex,
    };
    twgl.setUniforms(postProgInfo, postUniforms);
    // Draw
    twgl.drawBufferInfo(gl, quadBufferInfo);
  };

  const drawLens = (ctx: CanvasRenderingContext2D) => {
    const scale = ctx.canvas.width / nPix;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

    // Main lens ellipse
    if (lensLightScale === 0) {
      ctx.strokeStyle = "#FF0000";
      ctx.beginPath();
      ctx.ellipse(
        (x_l * scale) / res,
        -(y_l * scale) / res, // since axis is flipped
        (r_ein / q_l / res) * scale,
        ((r_ein * q_l) / res) * scale,
        -(phi_lDeg * Math.PI) / 180,
        0,
        2 * Math.PI
      );
      ctx.stroke();
    }

    // Subhalo dot
    for (let i = 0; i < N_SH; i++) {
      ctx.beginPath();
      ctx.arc(
        (shParams.x_shs[i] * scale) / res,
        -(shParams.y_shs[i] * scale) / res, // since axis is flipped
        2,
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = "#FF0000";
      ctx.fill();
    }

    ctx.restore();
  };

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
              <Canvas
                ctxName="webgl"
                draw={drawSource}
                width={canvasDim}
                height={canvasDim}
                style={{ width: canvasDim, height: canvasDim }}
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
              <div
                style={{
                  position: "relative",
                  width: canvasDim,
                  height: canvasDim,
                }}
              >
                <Canvas
                  ctxName="webgl"
                  draw={drawImage}
                  width={nPix}
                  height={nPix}
                  style={{
                    position: "absolute",
                    left: "0px",
                    top: "0px",
                    width: canvasDim,
                    height: canvasDim,
                    imageRendering: "pixelated",
                    zIndex: 1,
                  }}
                />
                <Canvas
                  ctxName="2d"
                  draw={drawLens}
                  width={canvasDim}
                  height={canvasDim}
                  style={{
                    position: "absolute",
                    left: "0px",
                    top: "0px",
                    width: canvasDim,
                    height: canvasDim,
                    imageRendering: "-moz-crisp-edges", // @ts-expect-error
                    imageRendering: "-webkit-crisp-edges", // @ts-expect-error
                    imageRendering: "pixelated", // @ts-expect-error
                    imageRendering: "crisp-edges",
                    zIndex: 2,
                  }}
                />
              </div>
            </div>
            <SHControls resampleSHs={() => setSHParams(sampleSHParams(N_SH))} />
            <LensControls
              phiDeg={phi_lDeg}
              q={q_l}
              r_ein={r_ein}
              lensLightScale={lensLightScale}
              setPhiDeg={setPhilDeg}
              setQ={setQl}
              setRein={setRein}
              setLensLightScale={setLensLightScale}
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
