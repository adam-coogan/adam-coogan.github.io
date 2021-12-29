import React, { useEffect, useRef, useState } from "react";
import ReactTooltip from "react-tooltip";
import runLensModel from "../utils/model";
import { sersic } from "../utils/sersic";
import { SIEParams } from "../utils/sie";
import { TNFWVirialParams } from "../utils/tnfw";
import { evalOnGrid, getScaledImage } from "../utils/utils";

const useCanvas = (draw: (ctx: CanvasRenderingContext2D) => void) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(ctx);
  }, [draw]);

  return canvasRef;
};

interface CanvasProps {
  draw: (ctx: CanvasRenderingContext2D) => void;
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

const drawSource = (
  sourceImage: Float32Array,
  minVal: number,
  maxVal: number,
  ctx: CanvasRenderingContext2D
) => {
  ctx.save();

  ctx.fillStyle = "#000000";
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

  // Draw source
  const image = getScaledImage(sourceImage, minVal, maxVal, ctx);
  ctx.putImageData(image, 0, 0);

  ctx.restore();
};

const drawLensed = (
  lensedImage: Float32Array,
  sieParams: SIEParams,
  tnfwParams: TNFWVirialParams,
  res: number,
  minVal: number,
  maxVal: number,
  ctx: CanvasRenderingContext2D
) => {
  ctx.save();

  ctx.fillStyle = "#000000";
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.imageSmoothingEnabled = false;

  // Draw observation
  const image = getScaledImage(lensedImage, minVal, maxVal, ctx);
  ctx.putImageData(image, 0, 0);

  // Draw critical curve
  const nPix = Math.sqrt(lensedImage.length);
  const scale = ctx.canvas.width / nPix;
  ctx.strokeStyle = "#FF0000";
  ctx.beginPath();
  ctx.ellipse(
    sieParams.x,
    sieParams.y,
    (sieParams.r_ein / sieParams.q / res) * scale,
    ((sieParams.r_ein * sieParams.q) / res) * scale,
    -sieParams.phi,
    0,
    2 * Math.PI
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(
    (tnfwParams.x * scale) / res,
    -(tnfwParams.y * scale) / res, // since axis is flipped
    3,
    0,
    2 * Math.PI,
    false
  );
  ctx.fillStyle = "#FF0000";
  ctx.fill();

  ctx.restore();
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

const SHControls = ({ x, y, M_200c, setX, setY, setM200c }) => (
  <div>
    <h2>Subhalo parameters</h2>
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
      label="Mass (M_200c) [M_sun]"
      value={M_200c}
      set={setM200c}
      min={1e5}
      max={10 ** 10.5}
      description="Subhalo mass in radius where density is 200 times rho_cr"
    />
  </div>
);

const TelescopeControls = ({ sigma_n, setSigmaN, setRes }) => (
  <div>
    <h2>Telescope</h2>
    <ParamControls
      label="Noise level"
      value={sigma_n}
      set={setSigmaN}
      min={0}
      max={2.5}
      description="Telescope noise level"
    />
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
    </div>
  </div>
);

const Lens = () => {
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

  // Subhalo parameters
  const [x_sh, setXsh] = useState(-1.1);
  const [y_sh, setYsh] = useState(-1.1);
  const [M_200c, setM200c] = useState(1e10);
  const tau = 6.0;

  // Telescope parameters
  const [res, setRes] = useState(0.1);
  const [sigma_n, setSigmaN] = useState(0);

  // Misc constants
  const dim = 5; // arcsec
  const upsample = 4;
  const canvasDim = 480;

  // Package everything up
  const sersicParams = {
    x: x_s,
    y: y_s,
    phi: (phi_sDeg * Math.PI) / 180,
    q: q_s,
    index,
    r_e,
    I_e,
  };
  const sieParams = {
    x: x_l,
    y: y_l,
    phi: (phi_lDeg * Math.PI) / 180,
    q: q_l,
    r_ein,
  };
  const tnfwParams = {
    x: x_sh,
    y: y_sh,
    M_200c,
    tau,
  };

  // Source without lensing
  const sourceImage = evalOnGrid(res, dim, upsample, (x, y) =>
    sersic(x, y, sersicParams)
  );

  // Lensed image
  const lensedImage = runLensModel(
    sersicParams,
    sieParams,
    tnfwParams,
    res,
    dim,
    upsample,
    sigma_n
  );

  // Set color scale
  const minVal = -3; // Math.min(...lensed);
  const maxVal = 18; // Math.max(...lensed);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
          padding: "0.5rem",
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
            draw={(ctx: CanvasRenderingContext2D) =>
              drawSource(sourceImage, minVal, maxVal, ctx)
            }
            width={canvasDim}
            height={canvasDim}
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
          setRes={setRes}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
          padding: "0.5rem",
        }}
      >
        <div>
          <h2 data-tip data-for="obsHeaderTT">
            Observation
          </h2>
          <ReactTooltip id="obsHeaderTT">
            Observation of lensed galaxy seen by telescope
          </ReactTooltip>
          <Canvas
            draw={(ctx: CanvasRenderingContext2D) =>
              drawLensed(
                lensedImage,
                sieParams,
                tnfwParams,
                res,
                minVal,
                maxVal,
                ctx
              )
            }
            width={canvasDim}
            height={canvasDim}
          />
        </div>
        <LensControls
          phiDeg={phi_lDeg}
          q={q_l}
          r_ein={r_ein}
          setPhiDeg={setPhilDeg}
          setQ={setQl}
          setRein={setRein}
        />
        <SHControls
          x={x_sh}
          y={y_sh}
          M_200c={M_200c}
          // c_200c={c_200c}
          // tau={tau}
          setX={setXsh}
          setY={setYsh}
          setM200c={setM200c}
          // setc200c={setc200c}
          // setTau={setTau}
        />
      </div>
    </div>
  );
};

export default Lens;
