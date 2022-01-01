import React, { useEffect, useRef, useState } from "react";
import ReactTooltip from "react-tooltip";
import { fsLensSource, getFSPost, vsSource } from "../utils/shaders";
import { createProgram, createShader } from "../utils/webglutils";
import { randn } from "../utils/utils";
// import twgl from "twgl.js";

/*
 * The plan
 * --------
 * - Switch to twgl
 * - Separate initialization and drawing steps
 * - Figure out how to show source
 * - Add subhalo
 * - Show lens ellipse and subhalo dot
 * - Show difference between images with and without subhalo
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
    const lensProgram = initProgram(gl, vsSource, fsLensSource);
    const postProgram = initProgram(gl, vsSource, fsPostSource);

    gl.useProgram(lensProgram);

    // Set source parameters
    const xSLoc = gl.getUniformLocation(lensProgram, "u_x_s");
    const ySLoc = gl.getUniformLocation(lensProgram, "u_y_s");
    const phiSLoc = gl.getUniformLocation(lensProgram, "u_phi_s");
    const qSLoc = gl.getUniformLocation(lensProgram, "u_q_s");
    const indexLoc = gl.getUniformLocation(lensProgram, "u_index");
    const rELoc = gl.getUniformLocation(lensProgram, "u_r_e");
    const IELoc = gl.getUniformLocation(lensProgram, "u_I_e");
    gl.uniform1f(xSLoc, x_s);
    gl.uniform1f(ySLoc, y_s);
    gl.uniform1f(phiSLoc, (phi_sDeg * Math.PI) / 180);
    gl.uniform1f(qSLoc, q_s);
    gl.uniform1f(indexLoc, index);
    gl.uniform1f(rELoc, r_e);
    gl.uniform1f(IELoc, I_e);
    // Set main lens parameters
    const xLLoc = gl.getUniformLocation(lensProgram, "u_x_l");
    const yLLoc = gl.getUniformLocation(lensProgram, "u_y_l");
    const phiLLoc = gl.getUniformLocation(lensProgram, "u_phi_l");
    const qLLoc = gl.getUniformLocation(lensProgram, "u_q_l");
    const rEinLoc = gl.getUniformLocation(lensProgram, "u_r_ein");
    gl.uniform1f(xLLoc, x_l);
    gl.uniform1f(yLLoc, y_l);
    gl.uniform1f(phiLLoc, (phi_lDeg * Math.PI) / 180);
    gl.uniform1f(qLLoc, q_l);
    gl.uniform1f(rEinLoc, r_ein);
    // Set image coordinate range
    gl.uniform1f(gl.getUniformLocation(lensProgram, "u_range"), range);
    // Set intermediate flux range
    gl.uniform1f(gl.getUniformLocation(lensProgram, "u_max_flux"), maxFlux);

    // Create texture
    const fluxTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fluxTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      nPixFine,
      nPixFine,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // Create framebuffer
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    // Attach texture
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      fluxTex,
      0
    );
    gl.viewport(0, 0, nPixFine, nPixFine);

    // Set up vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Associate shader attributes with data buffers
    const posAttribLoc = gl.getAttribLocation(lensProgram, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); // make sure correct buffer is bound
    gl.vertexAttribPointer(posAttribLoc, 2, gl.FLOAT, false, 0, 0); // how to extract data
    gl.enableVertexAttribArray(posAttribLoc); // turn attribute on

    // Draw to framebuffer texture
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW // never changes
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Unbind framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, nPix, nPix);

    // Next, apply PSF, pixelation and noise
    gl.useProgram(postProgram);

    // Set number of pixels for average pooling
    const nPixFineLoc = gl.getUniformLocation(postProgram, "u_n_pix_fine");
    gl.uniform1f(nPixFineLoc, nPixFine);
    const nPixLoc = gl.getUniformLocation(postProgram, "u_n_pix");
    gl.uniform1f(nPixLoc, nPix);
    // TODO: put noise into a texture, unrescale and add
    gl.uniform1f(
      gl.getUniformLocation(postProgram, "u_noise_range"),
      noiseRange
    );
    gl.uniform1f(gl.getUniformLocation(postProgram, "u_sigma_n"), sigma_n);
    // Set intermediate flux range
    gl.uniform1f(gl.getUniformLocation(postProgram, "u_max_flux"), maxFlux);
    // Set flux scale
    gl.uniform1f(gl.getUniformLocation(postProgram, "u_low_flux"), lowFlux);
    gl.uniform1f(gl.getUniformLocation(postProgram, "u_high_flux"), highFlux);

    // Set up flux texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fluxTex);
    gl.uniform1i(gl.getUniformLocation(postProgram, "u_flux_tex"), 0);

    // Put into texture
    const noiseTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, noiseTex);
    // See https://webglfundamentals.org/webgl/lessons/webgl-data-textures.html
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      nPix,
      nPix,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      noiseArray
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // Pass to shader
    gl.uniform1i(gl.getUniformLocation(postProgram, "u_noise_tex"), 1);

    // Draw to canvas
    gl.drawArrays(gl.TRIANGLES, 0, 6);
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
