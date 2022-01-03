/*
 * Shaders for lensing.
 *
 * Average pooling references
 * - https://stackoverflow.com/questions/5879403/opengl-texture-coordinates-in-pixel-space
 * - https://computergraphics.stackexchange.com/questions/5724/glsl-can-someone-explain-why-gl-fragcoord-xy-screensize-is-performed-and-for
 */

export const vsSource = `
attribute vec2 a_position;

uniform float u_range;
uniform vec2 u_translation;

varying vec2 v_xy;
// varying vec2 v_texcoord; // DEBUG

void main() {
  gl_PointSize = 1.0;
  v_xy = a_position * u_range; // image coordinates
  // v_texcoord = a_position * 0.5 + 0.5; // texture coordinates
  gl_Position = vec4(a_position, 0, 1);
}
`;

export const fsLensSource = `
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
// Subhalo parameters
uniform float u_x_sh;
uniform float u_y_sh;
uniform float u_rho_s;
uniform float u_r_s;
uniform float u_tau;
// Intermediate flux scale
uniform float u_max_flux;

// Image positions
varying vec2 v_xy;
// varying vec2 v_texcoord;

// Subhalo and lens constants
// TODO: generate shader with correct constants
float pi = 3.1415926535;
float s_min = 1e-12;
float G_over_c2 = 4.79e-20; // Mpc / MSol
float zSrc = 2.5;
float dASrc = 1704.8621; // Mpc
float dALens = 1420.2484; // Mpc
float dComovingSrc = 5967.0171; // Mpc
float dComovingLens = 2272.3975; // Mpc
float dALS = (dComovingSrc - dComovingLens) / (1.0 + zSrc);
float Sigma_cr = 1.0 / (4.0 * pi * G_over_c2 * dALens * dALS / dASrc);

float log10(float x) {
  return log(x) / 2.302585093;
}

float acosh(float x) {
  return log(x + sqrt(x * x - 1.0));
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

vec2 alpha_tnfw(float x, float y) {
  // Convert scale radius to angular scale
  float theta_s = (u_r_s / dALens) * ((180.0 / pi) * 60.0 * 60.0); // arcsec

  float dx = x - u_x_sh;
  float dy = y - u_y_sh;
  float s = sqrt(dx * dx + dy * dy) / theta_s;
  float f =
    (s >= 1.0 ? acos(1.0 / s) : acosh(1.0 / s)) /
    sqrt(abs(s * s - 1.0));
  float l = log((s + s_min) / (sqrt(s * s + u_tau * u_tau) + u_tau));
  float m =
    ((4.0 * pi * u_tau * u_tau) / ((u_tau * u_tau + 1.0) * (u_tau * u_tau + 1.0))) *
    ((u_tau * u_tau + 2.0 * s * s - 1.0) * f +
      pi * u_tau +
      (u_tau * u_tau - 1.0) * log(u_tau) +
      sqrt(s * s + u_tau * u_tau) * (((u_tau * u_tau - 1.0) / u_tau) * l - pi));
  float k_s = (u_rho_s * u_r_s) / Sigma_cr;

  float alpha_scale = (k_s * m) / pi / ((s + s_min) * (s + s_min));
  return vec2(alpha_scale * dx, alpha_scale * dy);
}

// Rescales the flux to (0, 1) and sets to R component of color
vec4 flux_to_r(float flux) {
  float unclipped = flux / u_max_flux;
  // float clipped = step(0.0, unclipped) * step(0.0, 1.0 - unclipped) * unclipped
  //     + step(1.0, unclipped);
  float clipped = unclipped < 0.0 ? 0.0 : (unclipped > 1.0 ? 1.0 : unclipped);
  return vec4(clipped, 0, 0, 1);
}

void main() {
  vec2 alpha = alpha_sie(v_xy[0], v_xy[1]) + alpha_tnfw(v_xy[0], v_xy[1]);
  vec2 xy_lensed = v_xy - alpha;
  float flux = sersic(xy_lensed[0], xy_lensed[1]);
  gl_FragColor = flux_to_r(flux);

  // // DEBUG: single red pixel
  // float upsample = 2.0;
  // vec2 coord = 2.0 * (v_texcoord - 0.5); // texture coordinates
  // gl_FragColor = vec4(
  //   step(0.0, coord[0]) *
  //   step(-0.5 / upsample, -coord[0]) *
  //   step(0.0, coord[1]) *
  //   step(-0.5 / upsample, -coord[1]),
  //   0,
  //   0,
  //   1
  // );
}
`;

export const getFSPost = (upsample: number) => {
  let source = `
precision mediump float;

// Noise-free fluxes
uniform sampler2D u_flux_tex;
// Noise array
uniform sampler2D u_noise_tex;
// Pixelation info
uniform float u_n_pix_fine;
uniform float u_n_pix;
// Intermediate flux scale
uniform float u_max_flux;
// Noise scale
uniform float u_noise_range;
uniform float u_sigma_n;
// Flux scale
uniform float u_low_flux;
uniform float u_high_flux;

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

float unrescale_flux(float r) {
  return r * u_max_flux;
}

float unrescale_noise(float n) {
  return 2.0 * (n - 0.5) * u_noise_range * u_sigma_n * 0.5;
}

float rescale_clip_flux(float flux) {
  float unclipped = (flux - u_low_flux) / (u_high_flux - u_low_flux);
  return (unclipped < 0.0 ? 0.0 : (unclipped > 1.0 ? 1.0 : unclipped));
  // return (
  //   step(0.0, unclipped) *
  //   step(0.0, 1.0 - unclipped) *
  //   unclipped + step(1.0, unclipped)
  // );
}

vec4 flux_to_noisy_rgba(float flux) {
  float scaled_noise = texture2D(u_noise_tex, gl_FragCoord.xy / u_n_pix).x;
  float noisy_flux = unrescale_flux(flux) + unrescale_noise(scaled_noise);
  return vec4(viridis(rescale_clip_flux(noisy_flux)), 1);
}

void main() {
  float avg_flux = (
`;
  const range = (upsample - 1) / 2;
  for (let i = -range; i <= range; i++) {
    source += "    //\n";
    for (let j = -range; j <= range; j++) {
      // Gets center of texture pixel and adds offset to average over fine
      // texture's pixels
      source +=
        `    texture2D(u_flux_tex, gl_FragCoord.xy / u_n_pix + vec2(${j.toFixed(
          1
        )}, ${i.toFixed(1)}) / u_n_pix_fine).x` +
        (j === range && i === range ? "" : " +") +
        "\n";
    }
  }

  source += `  ) / ${(upsample ** 2).toFixed(1)};\n`;
  source += `  gl_FragColor = flux_to_noisy_rgba(avg_flux);`;
  source += "\n}";

  return source;
};
