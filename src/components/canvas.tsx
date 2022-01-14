import React, { useEffect, useRef } from "react";

/*
 * A canvas component for a user-specified context type.
 */

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

export default Canvas;
