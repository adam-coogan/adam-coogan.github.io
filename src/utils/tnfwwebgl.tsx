// TODO: generate shader with correct constants
// Constants
// const s_min = 1e-12;
// const G_over_c2 = 4.79e-20; // Mpc / MSol
const rho_cr_0 = 127052815397.49832; // MSol / Mpc**3
const Om0 = 0.30966;
const Delta = 200;
// Lens constants
// const zSrc = 2.5;
const zLens = 0.6;
const rho_cr = rho_cr_0 * (Om0 * (1 + zLens) ** 3 + (1 - Om0));
// const dASrc = 1704.8621; // Mpc
// const dALens = 1420.2484; // Mpc
// const dComovingSrc = 5967.0171; // Mpc
// const dComovingLens = 2272.3975; // Mpc
// const dALS = (dComovingSrc - dComovingLens) / (1 + zSrc);
// const Sigma_cr = 1 / ((4 * Math.PI * G_over_c2 * dALens * dALS) / dASrc);

const c_200c_to_delta_200c = (c_200c: number) => {
  const integral_to_c = Math.log(1 + c_200c) - c_200c / (1 + c_200c);
  return ((Delta / 3) * c_200c ** 3) / integral_to_c;
};

const M_200c_to_r_200c = (M_200c: number) =>
  (((3 / (4 * Math.PI)) * M_200c) / (Delta * rho_cr)) ** (1 / 3);

/*
 * Redshift-dependent mass-concentration relation from Correa+ 2015.
 * https://arxiv.org/abs/1502.00391
 */
const massConcentrationRelation = (M_200c: number, z: number) => {
  const cond = 4 - z;
  const alpha =
    cond >= 0
      ? 1.7543 - 0.2766 * (1.0 + z) + 0.02039 * (1.0 + z) ** 2
      : 1.3081 - 0.1078 * (1.0 + z) + 0.00398 * (1.0 + z) ** 2;
  const beta =
    cond >= 0
      ? 0.2753 + 0.0035 * (1.0 + z) - 0.3038 * (1.0 + z) ** 0.0269
      : 0.0223 - 0.0944 * (1.0 + z) ** -0.3907;
  const gamma = cond >= 0 ? -0.01537 + 0.02102 * (1.0 + z) ** -0.1475 : 0;
  const log_10_c200 =
    alpha + beta * Math.log10(M_200c) * (1.0 + gamma * Math.log10(M_200c) ** 2);
  return 10 ** log_10_c200;
};

/*
 * Convert M_200c to (rho_s, r_s) using default mass-concentration relation.
 */
export const virialToScale = (M_200c: number) => {
  const c_200c = massConcentrationRelation(M_200c, zLens);
  return {
    rho_s: rho_cr * c_200c_to_delta_200c(c_200c),
    r_s: M_200c_to_r_200c(M_200c) / c_200c,
  };
};

export interface TNFWVirialParams {
  x: number;
  y: number;
  M_200c: number;
  tau: number;
}

export interface TNFWScaleParams {
  x: number;
  y: number;
  rho_s: number;
  r_s: number;
  tau: number;
}
