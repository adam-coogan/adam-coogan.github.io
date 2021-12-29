export interface SersicParams {
  x: number;
  y: number;
  phi: number;
  q: number;
  index: number;
  r_e: number;
  I_e: number;
}

/*
 * Gets intensity of a Sersic source.
 */
export const sersic = (x: number, y: number, params: SersicParams) => {
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
