import React, { useEffect, useRef, useState } from "react";
import ReactTooltip from "react-tooltip";
import fragmentShaderSource from "./shader.frag";
import vertexShaderSource from "./shader.vert";
import {
  createShader,
  createProgram,
  resizeCanvasToDisplaySize,
} from "./webglutils";

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
      min={-5}
      max={5}
    />
    <ParamControls
      label="Position (y) ['']"
      value={y}
      set={setY}
      min={-5}
      max={5}
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

/*
 * Initialize shaders and program.
 */
const init = (gl: WebGLRenderingContext) => {
  // Create shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  // Link shaders into a program
  const program = createProgram(gl, vertexShader, fragmentShader);
  // Make canvas match display size
  resizeCanvasToDisplaySize(gl.canvas);
  // Tell webgl clip space (-1, +1) maps to (0, width) and (0, height)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // Set clear color
  gl.clearColor(0.0, 0.0, 0.0, 0.1);
  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  // Tell webgl which program to execute
  gl.useProgram(program);
  return program;
};

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
  // Misc constants
  const canvasDim = 500;
  const obsSize = 2.5; // arcsec
  const minFlux = -3;
  const maxFlux = 18;

  const draw = (gl: WebGLRenderingContext) => {
    const program = init(gl);

    // Set source parameters
    const xSLoc = gl.getUniformLocation(program, "u_x_s");
    const ySLoc = gl.getUniformLocation(program, "u_y_s");
    const phiSLoc = gl.getUniformLocation(program, "u_phi_s");
    const qSLoc = gl.getUniformLocation(program, "u_q_s");
    const indexLoc = gl.getUniformLocation(program, "u_index");
    const rELoc = gl.getUniformLocation(program, "u_r_e");
    const IELoc = gl.getUniformLocation(program, "u_I_e");
    gl.uniform1f(xSLoc, x_s);
    gl.uniform1f(ySLoc, y_s);
    gl.uniform1f(phiSLoc, (phi_sDeg * Math.PI) / 180);
    gl.uniform1f(qSLoc, q_s);
    gl.uniform1f(indexLoc, index);
    gl.uniform1f(rELoc, r_e);
    gl.uniform1f(IELoc, I_e);
    // Set main lens parameters
    const xLLoc = gl.getUniformLocation(program, "u_x_l");
    const yLLoc = gl.getUniformLocation(program, "u_y_l");
    const phiLLoc = gl.getUniformLocation(program, "u_phi_l");
    const qLLoc = gl.getUniformLocation(program, "u_q_l");
    const rEinLoc = gl.getUniformLocation(program, "u_r_ein");
    gl.uniform1f(xLLoc, x_l);
    gl.uniform1f(yLLoc, y_l);
    gl.uniform1f(phiLLoc, (phi_lDeg * Math.PI) / 180);
    gl.uniform1f(qLLoc, q_l);
    gl.uniform1f(rEinLoc, r_ein);
    // Set image coordinate range
    const rangeLoc = gl.getUniformLocation(program, "u_range");
    gl.uniform1f(rangeLoc, obsSize);
    // Set color range
    const minFluxLoc = gl.getUniformLocation(program, "u_min_flux");
    const maxFluxLoc = gl.getUniformLocation(program, "u_max_flux");
    gl.uniform1f(minFluxLoc, minFlux);
    gl.uniform1f(maxFluxLoc, maxFlux);

    // Set up vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Associate shader attributes with data buffers
    const posAttribLoc = gl.getAttribLocation(program, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); // make sure correct buffer is bound
    gl.vertexAttribPointer(posAttribLoc, 2, gl.FLOAT, false, 0, 0); // how to extract data
    gl.enableVertexAttribArray(posAttribLoc); // turn attribute on

    // Draw square covering canvas
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW // never changes
    );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  return (
    <div>
      <Canvas draw={draw} width={canvasDim} height={canvasDim} />
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
    </div>
  );
};

export default Page;
