import React, { useEffect, useRef, useState } from "react";
import ReactTooltip from "react-tooltip";
import { fsLensSource, getFSPost, vsSource } from "../utils/shaders";
import { createProgram, createShader } from "../utils/webglutils";
import { randn } from "../utils/utils";
import * as twgl from "twgl.js"; // weird import structure

twgl.setDefaults({ attribPrefix: "a_" });

/*
 * The plan
 * --------
 * -[X] Switch to twgl
 * -[ ] Separate initialization and drawing steps
 * -[ ] Figure out how to show source
 * -[ ] Add subhalo
 * -[ ] Show lens ellipse and subhalo dot
 * -[ ] Show difference between images with and without subhalo
 */

// Generate post-processesing shader
const UPSAMPLE = 4;
const fsPostSource = getFSPost(UPSAMPLE);

const useCanvas = (draw: (gl: WebGLRenderingContext) => void) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) console.log("no webgl!");
    draw(gl);
  }, [draw]);

  return canvasRef;
};

interface CanvasProps {
  draw: (gl: WebGLRenderingContext) => void;
  [rest: string]: any;
}

const Canvas = (props: CanvasProps) => {
  const { draw, ...rest } = props;
  const canvasRef = useCanvas(draw);
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
      <input
        style={{ flex: 1, margin: "0.2rem", minWidth: 0 }}
        type="text"
        min={min}
        max={max}
        step={0.001}
        value={value}
        onChange={(e) => set(parseFloat(e.target.value))}
      />
      <input
        style={{ flex: 3, margin: "0.2rem" }}
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
      label="Position (x) ['']"
      value={x}
      set={setX}
      min={-2.5}
      max={2.5}
    />
    <ParamControls
      label="Position (y) ['']"
      value={y}
      set={setY}
      min={-2.5}
      max={2.5}
    />
    <ParamControls
      label="Orientation (ϕ) [deg]"
      value={phiDeg}
      set={setPhiDeg}
      min={-180}
      max={180}
      description="Orientation of source relative to x-axis"
    />
    <ParamControls
      label="Ellipticity (q)"
      value={q}
      set={setQ}
      min={0.15}
      max={0.9999}
      description="Controls whether source is circular (q=1) or elliptical (q=0)"
    />
    <ParamControls
      label="Index"
      value={index}
      set={setIndex}
      min={0.5}
      max={5}
      description="Higher values cause source brightness to decrease sharply with radius"
    />
    <ParamControls
      label="Size (r_e) ['']"
      value={r_e}
      set={setRe}
      min={0.0001}
      max={10}
      description="Sets the size of the source"
    />
  </div>
);

const LensControls = ({ phiDeg, q, r_ein, setPhiDeg, setQ, setRein }) => (
  <div>
    <h2>Lens parameters</h2>
    <ParamControls
      label="Orientation (ϕ) [deg]"
      value={phiDeg}
      set={setPhiDeg}
      min={-180}
      max={180}
      description="Orientation of lens relative to x-axis"
    />
    <ParamControls
      label="Ellipticity (q)"
      value={q}
      set={setQ}
      min={0.15}
      max={0.9999}
      description="Controls whether lens is circular (q=1) or elliptical (q=0)"
    />
    <ParamControls
      label="Einstein radius (r_ein)"
      value={r_ein}
      set={setRein}
      min={0.0001}
      max={2.5}
      description="Sets the size of the lens"
    />
  </div>
);

const TelescopeControls = ({ sigma_n, setSigmaN, setRes, resampleNoise }) => (
  <div>
    <h2>Telescope</h2>
    <ParamControls
      label="Noise level"
      value={sigma_n}
      set={setSigmaN}
      min={0}
      max={3.0}
      description="Telescope noise level"
    />
    <button style={{ margin: "0.1rem" }} onClick={() => resampleNoise()}>
      Resample noise
    </button>
    <div>
      <button style={{ margin: "0.1rem" }} onClick={() => setRes(0.012)}>
        ELT
      </button>
      <button style={{ margin: "0.1rem" }} onClick={() => setRes(0.031)}>
        JWST
      </button>
      <button style={{ margin: "0.1rem" }} onClick={() => setRes(0.05)}>
        Hubble Space Telescope
      </button>
      <button style={{ margin: "0.1rem" }} onClick={() => setRes(0.1)}>
        Euclid
      </button>
      <button style={{ margin: "0.1rem" }} onClick={() => setRes(0.7)}>
        Rubin Observatory
      </button>
      <button style={{ margin: "0.1rem" }} onClick={() => setRes(1.25)}>
        Chunky
      </button>
    </div>
  </div>
);

/*
 * Initialize shaders and program.
 */
const initProgram = (
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
) => {
  // Create shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  // Link shaders into a program
  const program = createProgram(gl, vertexShader, fragmentShader);
  // Make canvas match display size
  //resizeCanvasToDisplaySize(gl.canvas);
  // Tell webgl clip space (-1, +1) maps to (0, width) and (0, height)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // Set clear color
  gl.clearColor(0.0, 0.0, 1.0, 0.5);
  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  return program;
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
  // Telescope parameters
  const [res, setRes] = useState(0.1);
  const [sigma_n, setSigmaN] = useState(0.5);
  // Intermediate flux scale
  const maxFlux = 23; // TODO: figure out how to reduce flux quantization... :[
  // Final flux scale
  const lowFlux = -3;
  const highFlux = 18;
  // Image constants
  const targetRange = 2.5; // arcsec
  const canvasDim = 400; // final canvas size
  const nPix = getNPix(canvasDim, targetRange, res); // final size in pixels
  const range = (nPix * res) / 2; // arcsec
  const nPixFine = UPSAMPLE * nPix; // fine grid pixel size
  // Noise
  const noiseRange = 5;
  const [noiseArray, setNoiseArray] = useState(
    getNoiseTexArray(nPix ** 2, noiseRange)
  );

  const draw = (gl: WebGLRenderingContext) => {
    const lensProgInfo = twgl.createProgramInfo(gl, [vsSource, fsLensSource]);
    const postProgInfo = twgl.createProgramInfo(gl, [vsSource, fsPostSource]);

    // Set up positions
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
      position: {
        numComponents: 2,
        data: [-1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, -1],
      },
    });
    twgl.setBuffersAndAttributes(gl, lensProgInfo, bufferInfo);

    // Do the lensing
    gl.useProgram(lensProgInfo.program);
    // Set source parameters
    const lensUniforms = {
      u_x_s: x_s,
      u_y_s: y_s,
      u_phi_s: (phi_sDeg * Math.PI) / 180,
      u_q_s: q_s,
      u_index: index,
      u_r_e: r_e,
      u_I_e: I_e,
      u_x_l: x_l,
      u_y_l: y_l,
      u_phi_l: (phi_lDeg * Math.PI) / 180,
      u_q_l: q_l,
      u_r_ein: r_ein,
      u_range: range,
      u_max_flux: maxFlux,
    };
    twgl.setUniforms(lensProgInfo, lensUniforms);
    // Create framebuffer texture to render to
    gl.viewport(0, 0, nPixFine, nPixFine);
    // TODO: checkFramebufferStatus?
    console.assert(
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE,
      "framebuffer is not ready to display"
    );
    const fb = twgl.createFramebufferInfo(
      gl,
      [
        {
          format: gl.RGBA,
          type: gl.UNSIGNED_BYTE,
          min: gl.NEAREST,
          mag: gl.NEAREST,
          wrap: gl.CLAMP_TO_EDGE,
        },
      ],
      nPixFine,
      nPixFine
    );
    // Draw to framebuffer texture
    twgl.drawBufferInfo(gl, bufferInfo);

    // Unbind framebuffer to switch to drawing to canvas
    twgl.bindFramebufferInfo(gl, null);

    // Apply PSF, pixelation and noise and draw to canvas
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
      u_flux_tex: fb.attachments[0],
      u_noise_tex: noiseTex,
    };
    twgl.setUniforms(postProgInfo, postUniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
  };

  return (
    <div>
      <Canvas
        draw={draw}
        width={nPix}
        height={nPix}
        style={{
          width: canvasDim,
          height: canvasDim,
          imageRendering: "pixelated",
        }}
      />
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
      <LensControls
        phiDeg={phi_lDeg}
        q={q_l}
        r_ein={r_ein}
        setPhiDeg={setPhilDeg}
        setQ={setQl}
        setRein={setRein}
      />
      <TelescopeControls
        sigma_n={sigma_n}
        setSigmaN={setSigmaN}
        setRes={(res: number) => {
          setRes(res);
          const newNPix = getNPix(canvasDim, targetRange, res);
          setNoiseArray(getNoiseTexArray(newNPix ** 2, noiseRange));
        }}
        resampleNoise={() =>
          setNoiseArray(getNoiseTexArray(nPix ** 2, noiseRange))
        }
      />
    </div>
  );
};

export default Page;
