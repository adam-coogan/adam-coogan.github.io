import React from "react";
import * as twgl from "twgl.js"; // weird import structure
import Canvas from "../../components/canvas";
import { fsSrcSource, vsSource } from "../../utils/shaders";

const SourceCanvas = ({
  x_s,
  y_s,
  phi_sDeg,
  q_s,
  index,
  r_e,
  I_e,
  lowFlux,
  highFlux,
  range,
  canvasDim,
}) => {
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
      u_low_flux: lowFlux,
      u_high_flux: highFlux,
    };
    twgl.setUniforms(srcProgInfo, uniforms);
    // Draw
    twgl.drawBufferInfo(gl, quadBufferInfo);
  };

  return (
    <Canvas
      ctxName="webgl"
      draw={drawSource}
      width={canvasDim}
      height={canvasDim}
      style={{ width: canvasDim, height: canvasDim }}
    />
  );
};

export default SourceCanvas;
