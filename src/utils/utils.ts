import { viridis } from "scale-color-perceptual";

const getCoord = (idx: number, nPix: number, res: number) =>
  (((nPix - 1) * res) / 2) * ((2 * idx) / (nPix - 1) - 1);

export const randn = () =>
  Math.sqrt(-2 * Math.log(1 - Math.random())) *
  Math.cos(2 * Math.PI * Math.random());

/*
 * Average-pools an array of size (nPix * upsample, nPix * upsample) to size
 * (nPix, nPix).
 */
const avgPool = (array: Float32Array, upsample: number) => {
  const nPix = Math.sqrt(array.length) / upsample;
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
export const evalOnGrid = (
  res: number,
  dim: number,
  upsample: number,
  fn: (x: number, y: number) => number
) => {
  const nPix = Math.round(dim / res);
  const resFine = res / upsample;
  const nPixFine = nPix * upsample;

  // Get pixel values on fine grid
  const array = new Float32Array(nPixFine ** 2);
  for (let i = 0; i < nPixFine; i += 1) {
    for (let j = 0; j < nPixFine; j += 1) {
      // Map index to coordinates, flipping y due to canvas coordinates
      let x = getCoord(j, nPixFine, resFine);
      let y = -getCoord(i, nPixFine, resFine);

      array[nPixFine * i + j] = fn(x, y);
    }
  }

  return avgPool(array, upsample);
};

/*
 * Upsamples an image to a larger grid.
 */
const nnInterp = (original: ImageData, target: ImageData) => {
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
 * Converts an array to a scaled grid of pixels in a canvas context.
 */
export const getScaledImage = (
  array: Float32Array,
  minVal: number,
  maxVal: number,
  ctx: CanvasRenderingContext2D
) => {
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

  // Upsample to make pixels visible and draw
  // TODO: there should be a better way to do this.
  const scale = ctx.canvas.width / nPix;
  const scaled = ctx.createImageData(
    Math.round(nPix * scale),
    Math.round(nPix * scale)
  );
  nnInterp(image, scaled);

  return scaled;
};
