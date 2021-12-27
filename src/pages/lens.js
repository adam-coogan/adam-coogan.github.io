import React, { useEffect, useRef, useState } from "react";
import { viridis } from "scale-color-perceptual";

const useCanvas = (draw) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(ctx);
  }, [draw]);

  return canvasRef;
};

const Canvas = (props) => {
  const { draw, ...rest } = props;
  const canvasRef = useCanvas(draw);
  return <canvas ref={canvasRef} {...rest} />;
};

const ParamControls = ({ label, value, set, min, max }) => (
  <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
    <label>{label}</label>
    <input
      type="text"
      min={min}
      max={max}
      step="any"
      value={value}
      onChange={(e) => set(parseFloat(e.target.value))}
    />
    <input
      type="range"
      min={min}
      max={max}
      step="any"
      value={value}
      onChange={(e) => set(parseFloat(e.target.value))}
    />
  </div>
);

/*
 * Upsamples an image to a larger grid.
 */
const nnInterp = (original, target) => {
  const scale = target.width / original.width;
  for (let i = 0; i < target.width; i += 1) {
    for (let j = 0; j < target.height; j += 1) {
      for (let c = 0; c < 4; c += 1) {
        // Find indices in original array
        let i_original = Math.floor(i / scale);
        let j_original = Math.floor(j / scale);
        let idx_original = i_original * original.width * 4 + j_original * 4 + c;

        let idx_buffer = i * target.width * 4 + j * 4 + c;

        target.data[idx_buffer] = original.data[idx_original];
      }
    }
  }
};

/*
 * Gets intensity of a Sersic source.
 */
const sersic = (x, y, params) => {
  const { x: x_s, y: y_s, phi, q, index, r_e, I_e } = params;
  const k = 2 * index - 1 / 3 + 4 / 405 / index + 46 / 25515 / index ** 2;
  const dx = x - x_s;
  const dy = y - y_s;
  const x_maj = dx * Math.cos(phi) + dy * Math.sin(phi);
  const x_min = -dx * Math.sin(phi) + dy * Math.cos(phi);
  const r = Math.sqrt(x_maj ** 2 * q + x_min ** 2 / q) / r_e;
  const exponent = -k * (r ** (1 / index) - 1);
  return I_e * Math.exp(exponent);
};

/*
 * Gets deflection field for a singular isothermal ellipsoid.
 */
const alpha_sie = (x, y, params) => {
  const { x: x_l, y: y_l, phi, q, r_ein } = params;

  // Transform to elliptical coordinates
  const dx = x - x_l;
  const dy = y - y_l;
  const rx = (dx * Math.cos(phi) + dy * Math.sin(phi)) * Math.sqrt(q);
  const ry = (-dx * Math.sin(phi) + dy * Math.cos(phi)) / Math.sqrt(q);
  const ang = Math.atan2(ry, rx);

  // Deflection field in lens frame
  const alpha_lf_scale =
    2 *
    r_ein *
    Math.sqrt(q / (1 - q ** 2)) *
    Math.atan(Math.sqrt((1 - q) / (1 + q)));
  const alpha_x_lf = alpha_lf_scale * Math.cos(ang);
  const alpha_y_lf = alpha_lf_scale * Math.sin(ang);

  // Deflection field in image frame
  const alpha_x = alpha_x_lf * Math.cos(phi) - alpha_y_lf * Math.sin(phi);
  const alpha_y = alpha_y_lf * Math.cos(phi) + alpha_x_lf * Math.sin(phi);

  return { alpha_x, alpha_y };
};

const getCoord = (idx, nPix, res) =>
  (((nPix - 1) * res) / 2) * ((2 * idx) / (nPix - 1) - 1);

/*
 * Average-pools an array of size (nPix * upsample, nPix * upsample) to size
 * (nPix, nPix).
 */
const avgPool = (array, nPix, upsample) => {
  const downsampled = new Float32Array(nPix ** 2);
  for (let i = 0; i < nPix; i += 1) {
    for (let j = 0; j < nPix; j += 1) {
      // Loop over subblock of fine grid
      let blockSum = 0;
      for (let iSub = 0; iSub < upsample; iSub += 1) {
        for (let jSub = 0; jSub < upsample; jSub += 1) {
          blockSum +=
            array[
              nPix * upsample * (i * upsample + iSub) + (j * upsample + jSub)
            ];
        }
      }
      downsampled[nPix * i + j] = blockSum / upsample ** 2;
    }
  }
  return downsampled;
};

/*
 * Perform lensing calculations.
 */
const getLensedAndSource = (srcParams, lensParams, res, dim, upsample) => {
  const nPix = Math.round(dim / res);
  const resFine = res / upsample;
  const nPixFine = nPix * upsample;

  // Get pixel values on fine grid
  const lensedFine = new Float32Array(nPixFine ** 2);
  const sourceFine = new Float32Array(nPixFine ** 2);
  for (let i = 0; i < nPixFine; i += 1) {
    for (let j = 0; j < nPixFine; j += 1) {
      // Map index to coordinates, flipping y due to canvas coordinates
      let x = getCoord(j, nPixFine, resFine);
      let y = -getCoord(i, nPixFine, resFine);
      // Source
      sourceFine[nPixFine * i + j] = sersic(x, y, srcParams);
      // Apply lensing equation
      const { alpha_x, alpha_y } = alpha_sie(x, y, lensParams);
      lensedFine[nPixFine * i + j] = sersic(
        x - alpha_x,
        y - alpha_y,
        srcParams
      );
    }
  }

  return {
    lensed: avgPool(lensedFine, nPix, upsample),
    source: avgPool(sourceFine, nPix, upsample),
  };
};

/*
 * Converts an array to a scaled grid of pixels in a canvas context.
 */
const getScaledImage = (array, minVal, maxVal, ctx) => {
  // Convert flux array to color image
  const nPix = Math.sqrt(array.length);
  const image = ctx.createImageData(nPix, nPix);
  for (let i = 0; i < nPix; i += 1) {
    for (let j = 0; j < nPix; j += 1) {
      let idx = nPix * i + j;
      let normalized = (array[idx] - minVal) / (maxVal - minVal);
      let color = viridis(Math.max(0, Math.min(1, normalized)));
      image.data[4 * idx + 0] = parseInt(color.slice(1, 3), 16);
      image.data[4 * idx + 1] = parseInt(color.slice(3, 5), 16);
      image.data[4 * idx + 2] = parseInt(color.slice(5, 7), 16);
      image.data[4 * idx + 3] = 256;
    }
  }
  console.log("i'm here!");
  // for (let idx = 0; idx < image.data.length; idx += 4) {
  //   let normalized = (array[idx / 4] - minVal) / (maxVal - minVal);
  //   let color = viridis(Math.max(0, Math.min(1, normalized)));
  //   image.data[idx + 0] = parseInt(color.slice(1, 3), 16);
  //   image.data[idx + 1] = parseInt(color.slice(3, 5), 16);
  //   image.data[idx + 2] = parseInt(color.slice(5, 7), 16);
  //   image.data[idx + 3] = 256;
  // }

  // Upsample to make pixels visible and draw
  // TODO: there should be a better way to do this.
  const scale = Math.round(ctx.canvas.width / nPix);
  const scaled = ctx.createImageData(nPix * scale, nPix * scale);
  nnInterp(image, scaled);

  return scaled;
};

const drawSource = (source, minVal, maxVal, ctx) => {
  ctx.save();

  ctx.fillStyle = "#000000";
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

  // Draw source
  const image = getScaledImage(source, minVal, maxVal, ctx);
  ctx.putImageData(image, 0, 0);

  ctx.restore();
};

const drawLensed = (lensed, lensParams, res, minVal, maxVal, ctx) => {
  ctx.save();

  ctx.fillStyle = "#000000";
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

  // Draw observation
  const image = getScaledImage(lensed, minVal, maxVal, ctx);
  ctx.putImageData(image, 0, 0);

  // Draw critical curve
  const nPix = Math.sqrt(lensed.length);
  const scale = Math.round(ctx.canvas.width / nPix);
  ctx.strokeStyle = "#FF0000";
  ctx.beginPath();
  ctx.ellipse(
    lensParams.x,
    lensParams.y,
    (lensParams.r_ein / lensParams.q / res) * scale,
    ((lensParams.r_ein * lensParams.q) / res) * scale,
    -lensParams.phi,
    0,
    2 * Math.PI
  );
  ctx.stroke();

  ctx.restore();
};

const Lens = () => {
  // Source parameters
  const [x_s, setXs] = useState(0.05);
  const [y_s, setYs] = useState(0.1);
  const [phi_s, setPhis] = useState(0.7);
  const [q_s, setQs] = useState(0.5);
  const [index, setIndex] = useState(4.0);
  const [r_e, setRe] = useState(5.0);
  const [I_e, setIe] = useState(0.05);
  // Lens parameters
  const x_l = 0.0; // const [x_l, setXl] = useState(0.0);
  const y_l = 0.0; // const [y_l, setYl] = useState(0.0);
  const [phi_l, setPhil] = useState(1.0);
  const [q_l, setQl] = useState(0.75);
  const [r_ein, setRein] = useState(1.5);
  // Observation parameters
  const [res, setRes] = useState(0.1);
  // Misc constants
  const dim = 5; // arcsec
  const upsample = 4;
  const canvasDim = 400;

  console.log(`r_ein = ${r_ein}, q_l = ${q_l}`);

  // Package everything up
  const srcParams = {
    x: x_s,
    y: y_s,
    phi: phi_s,
    q: q_s,
    index,
    r_e,
    I_e,
  };
  const lensParams = {
    x: x_l,
    y: y_l,
    phi: phi_l,
    q: q_l,
    r_ein,
  };

  // Do the lensing
  const { lensed, source } = getLensedAndSource(
    srcParams,
    lensParams,
    res,
    dim,
    upsample
  );
  const minVal = 0.0; // Math.min(...lensed);
  const maxVal = 18; // sersic(x_s, y_s, srcParams) / 10; // Math.max(...lensed);

  return (
    <div
      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>
          <h2>Lens</h2>
          {/*<ParamControls label="x_l" value={x_l} set={setXl} min={-5} max={5} />*/}
          {/*<ParamControls label="y_l" value={y_l} set={setYl} min={-5} max={5} />*/}
          <ParamControls
            label="phi_l"
            value={phi_l}
            set={setPhil}
            min={-Math.PI}
            max={Math.PI}
          />
          <ParamControls
            label="q_l"
            value={q_l}
            set={setQl}
            min={0.15}
            max={0.9999}
          />
          <ParamControls
            label="r_ein"
            value={r_ein}
            set={setRein}
            min={0.0001}
            max={2.5}
          />
        </div>
        <div>
          <h2>Source</h2>
          <ParamControls label="x_s" value={x_s} set={setXs} min={-5} max={5} />
          <ParamControls label="y_s" value={y_s} set={setYs} min={-5} max={5} />
          <ParamControls
            label="phi_s"
            value={phi_s}
            set={setPhis}
            min={-Math.PI}
            max={Math.PI}
          />
          <ParamControls
            label="q_s"
            value={q_s}
            set={setQs}
            min={0.15}
            max={0.9999}
          />
          <ParamControls
            label="index"
            value={index}
            set={setIndex}
            min={0.5}
            max={10}
          />
          <ParamControls
            label="r_e"
            value={r_e}
            set={setRe}
            min={0.0001}
            max={10}
          />
        </div>
        <div>
          <h2>Telescope</h2>
          <label>Resolution</label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <button onClick={() => setRes(0.012)}>ELT</button>
            <button onClick={() => setRes(0.031)}>JWST</button>
            <button onClick={() => setRes(0.05)}>Hubble Space Telescope</button>
            <button onClick={() => setRes(0.1)}>Euclid</button>
            <button onClick={() => setRes(0.7)}>Rubin Observatory</button>
          </div>
        </div>
      </div>
      <div>
        <h2>Source</h2>
        <Canvas
          style={{ padding: "10px" }}
          draw={(ctx) => drawSource(source, minVal, maxVal, ctx)}
          width={canvasDim}
          height={canvasDim}
        />
      </div>
      <div>
        <h2>Observation</h2>
        <Canvas
          style={{ padding: "10px" }}
          draw={(ctx) =>
            drawLensed(lensed, lensParams, res, minVal, maxVal, ctx)
          }
          width={canvasDim}
          height={canvasDim}
        />
      </div>
    </div>
  );
};

export default Lens;
