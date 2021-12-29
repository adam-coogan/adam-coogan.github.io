export interface SIEParams {
  x: number;
  y: number;
  phi: number;
  q: number;
  r_ein: number;
}

/*
 * Gets deflection field for a singular isothermal ellipsoid.
 */
export const alpha_sie = (x: number, y: number, params: SIEParams) => {
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
