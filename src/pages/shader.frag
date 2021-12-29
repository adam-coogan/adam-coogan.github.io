const fragmentShaderSource = `
precision mediump float;

// Source parameters
uniform float u_x_s;
uniform float u_y_s;
uniform float u_phi_s;
uniform float u_q_s;
uniform float u_index;
uniform float u_r_e;
uniform float u_I_e;
// Main lens parameters
uniform float u_x_l;
uniform float u_y_l;
uniform float u_phi_l;
uniform float u_q_l;
uniform float u_r_ein;
// Flux scale
uniform float u_min_flux;
uniform float u_max_flux;

// Image positions
varying vec2 v_xy;

// From https://www.shadertoy.com/view/WlfXRN
vec3 viridis(float t) {
  const vec3 c0 = vec3(0.2777273272234177, 0.005407344544966578, 0.3340998053353061);
  const vec3 c1 = vec3(0.1050930431085774, 1.404613529898575, 1.384590162594685);
  const vec3 c2 = vec3(-0.3308618287255563, 0.214847559468213, 0.09509516302823659);
  const vec3 c3 = vec3(-4.634230498983486, -5.799100973351585, -19.33244095627987);
  const vec3 c4 = vec3(6.228269936347081, 14.17993336680509, 56.69055260068105);
  const vec3 c5 = vec3(4.776384997670288, -13.74514537774601, -65.35303263337234);
  const vec3 c6 = vec3(-5.435455855934631, 4.645852612178535, 26.3124352495832);

  return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
}

vec4 fluxToRGBA(float flux) {
  float unclipped = (flux - u_min_flux) / (u_max_flux - u_min_flux);
  float clipped = step(0.0, unclipped) * step(0.0, 1.0 - unclipped) * unclipped
      + step(1.0, unclipped);
  return vec4(viridis(clipped), 1);
}

float sersic(float x, float y) {
  // Position relative to source
  float dx = x - u_x_s;
  float dy = y - u_y_s;

  float k = 2.0 * u_index - 1.0 / 3.0 + 4.0 / 405.0 / u_index + 46.0 / 25515.0 / (u_index * u_index);
  float x_maj = dx * cos(u_phi_s) + dy * sin(u_phi_s);
  float x_min = -dx * sin(u_phi_s) + dy * cos(u_phi_s);
  float r = sqrt(x_maj * x_maj * u_q_s + x_min * x_min / u_q_s) / u_r_e;
  float exponent = -k * (pow(r, 1.0 / u_index) - 1.0);
  return u_I_e * exp(exponent);
}

vec2 alpha_sie(float x, float y) {
  // Transform to elliptical coordinates
  float dx = x - u_x_l;
  float dy = y - u_y_l;
  float rx = (dx * cos(u_phi_l) + dy * sin(u_phi_l)) * sqrt(u_q_l);
  float ry = (-dx * sin(u_phi_l) + dy * cos(u_phi_l)) / sqrt(u_q_l);
  float ang = atan(ry, rx);

  // Deflection field in lens frame
  float alpha_lf_scale =
    2.0 *
    u_r_ein *
    sqrt(u_q_l / (1.0 - u_q_l * u_q_l)) *
    atan(sqrt((1.0 - u_q_l) / (1.0 + u_q_l)));
  float alpha_x_lf = alpha_lf_scale * cos(ang);
  float alpha_y_lf = alpha_lf_scale * sin(ang);

  // Deflection field in image frame
  float alpha_x = alpha_x_lf * cos(u_phi_l) - alpha_y_lf * sin(u_phi_l);
  float alpha_y = alpha_x_lf * sin(u_phi_l) + alpha_y_lf * cos(u_phi_l);

  return vec2(alpha_x, alpha_y);
}

void main() {
  vec2 xy_lensed = v_xy - alpha_sie(v_xy[0], v_xy[1]);
  float flux = sersic(xy_lensed[0], xy_lensed[1]);
  gl_FragColor = fluxToRGBA(flux);
}
`;

export default fragmentShaderSource;
