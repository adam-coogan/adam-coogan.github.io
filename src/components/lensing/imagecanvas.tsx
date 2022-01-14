import React from "react";
import * as twgl from "twgl.js"; // weird import structure
import Canvas from "../../components/canvas";
import { virialToScale } from "../../utils/tnfwwebgl";
import { fsPostSource, vsSource } from "../../utils/shaders";

//  u_x_sh: new Array([x_sh]),
//  u_y_sh: new Array([y_sh]),
//  u_rho_s: new Array([rho_s]),
//  u_r_s: new Array([r_s]),
//  u_tau: new Array([tau]),

interface ImageCanvasProps {
  fsLensSource: string;
  // Source parameters
  x_s: number;
  y_s: number;
  phi_sDeg: number;
  q_s: number;
  index: number;
  r_e: number;
  I_e: number;
  // Main lens parameters
  x_l: number;
  y_l: number;
  phi_lDeg: number;
  q_l: number;
  r_ein: number;
  lensLightScale: number;
  // External shear parameters
  gamma_1: number;
  gamma_2: number;
  // Subhalo parameters
  x_sh: number[];
  y_sh: number[];
  M_200c: number[];
  tau: number[];
  // Misc parameters
  noiseArray: Uint8Array;
  noiseRange: number;
  sigma_n: number;
  maxFlux: number;
  lowFlux: number;
  highFlux: number;
  res: number;
  nPix: number;
  nPixFine: number;
  range: number;
  canvasDim: number;
}

const ImageCanvas = ({
  fsLensSource,
  // Source parameters
  x_s,
  y_s,
  phi_sDeg,
  q_s,
  index,
  r_e,
  I_e,
  // Main lens parameters
  x_l,
  y_l,
  phi_lDeg,
  q_l,
  r_ein,
  lensLightScale,
  // External shear parameters
  gamma_1,
  gamma_2,
  // Subhalo parameters
  x_sh,
  y_sh,
  M_200c,
  tau,
  // Misc parameters
  noiseArray,
  noiseRange,
  sigma_n,
  maxFlux,
  lowFlux,
  highFlux,
  res,
  nPix,
  nPixFine,
  range,
  canvasDim,
}: ImageCanvasProps) => {
  console.log(x_sh, y_sh, M_200c);
  // Convert from virial to scale subhalo parameters
  const n_sh = x_sh.length;
  const rho_s = new Array(n_sh);
  const r_s = new Array(n_sh);
  for (let i = 0; i < n_sh; i++) {
    const { rho_s: _rho_s, r_s: _r_s } = virialToScale(M_200c[i]);
    rho_s[i] = _rho_s;
    r_s[i] = _r_s;
  }

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
      u_x_sh: x_sh,
      u_y_sh: y_sh,
      u_rho_s: rho_s,
      u_r_s: r_s,
      u_tau: tau,
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

  /*
   * Indicate main lens and subhalo parameters
   */
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
    for (let i = 0; i < n_sh; i++) {
      ctx.beginPath();
      ctx.arc(
        (x_sh[i] * scale) / res,
        -(y_sh[i] * scale) / res, // since axis is flipped
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
  );
};

export default ImageCanvas;
