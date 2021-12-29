import { sersic, SersicParams } from "./sersic";
import { alpha_sie, SIEParams } from "./sie";
import { alpha_tnfw, TNFWVirialParams, virialToScale } from "./tnfw";
import { evalOnGrid, randn } from "./utils";

/*
 * Perform lensing calculations.
 */
const runLensModel = (
  srcParams: SersicParams,
  lensParams: SIEParams,
  shParams: TNFWVirialParams,
  res: number,
  dim: number,
  upsample: number,
  sigma_n: number
) => {
  // Convert virial to scale parameters
  const scaleSHParams = {
    x: shParams.x,
    y: shParams.y,
    tau: shParams.tau,
    ...virialToScale(shParams.M_200c),
  };

  // Apply lensing equation
  const lensFn = (x: number, y: number) => {
    const { alpha_x: alpha_x_ml, alpha_y: alpha_y_ml } = alpha_sie(
      x,
      y,
      lensParams
    );
    const { alpha_x: alpha_x_sh, alpha_y: alpha_y_sh } = alpha_tnfw(
      x,
      y,
      scaleSHParams
    );
    const alpha_x = alpha_x_ml + alpha_x_sh;
    const alpha_y = alpha_y_ml + alpha_y_sh;
    return sersic(x - alpha_x, y - alpha_y, srcParams);
  };

  const lensed = evalOnGrid(res, dim, upsample, lensFn);

  // Add noise if necessary
  if (sigma_n <= 0) {
    return lensed;
  } else {
    const lensedNoisy = new Float32Array(Math.round(dim / res) ** 2);
    for (let i = 0; i < lensed.length; i += 1) {
      lensedNoisy[i] = lensed[i] + sigma_n * randn();
    }
    return lensedNoisy;
  }
};

export default runLensModel;
