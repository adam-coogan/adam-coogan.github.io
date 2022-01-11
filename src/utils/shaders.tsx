/*
 * Shaders for lensing.
 *
 * Average pooling references
 * - https://stackoverflow.com/questions/5879403/opengl-texture-coordinates-in-pixel-space
 * - https://computergraphics.stackexchange.com/questions/5724/glsl-can-someone-explain-why-gl-fragcoord-xy-screensize-is-performed-and-for
 */

// Shared uniforms and functions
const sersicFn = `
float sersic(
  float x,
  float y,
  float x_s,
  float y_s,
  float phi_s,
  float q_s,
  float index,
  float r_e,
  float I_e
) {
  // Position relative to source
  float dx = x - x_s;
  float dy = y - y_s;

  float k = 2.0 * index - 1.0 / 3.0 + 4.0 / 405.0 / index + 46.0 / 25515.0 / (index * index);
  float x_maj = dx * cos(phi_s) + dy * sin(phi_s);
  float x_min = -dx * sin(phi_s) + dy * cos(phi_s);
  float r = sqrt(x_maj * x_maj * q_s + x_min * x_min / q_s) / r_e;
  float exponent = -k * (pow(r, 1.0 / index) - 1.0);
  return I_e * exp(exponent);
}
`;

const rescaleClipFluxFn = `
float rescale_clip_flux(float flux, float low_flux, float high_flux) {
  float unclipped = (flux - low_flux) / (high_flux - low_flux);
  return (unclipped < 0.0 ? 0.0 : (unclipped > 1.0 ? 1.0 : unclipped));
}
`;

const viridisFn = `
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
`;

/*
 * Gets lens plane coordinates
 */
export const vsSource = `
attribute vec2 a_position;

uniform float u_range;

varying vec2 v_xy;
// varying vec2 v_texcoord; // DEBUG

void main() {
  v_xy = a_position * u_range; // image coordinates
  // v_texcoord = a_position * 0.5 + 0.5; // DEBUG
  gl_Position = vec4(a_position, 0, 1);
}
`;

export const fsSrcSource = `
precision mediump float;

// Source parameters
uniform float u_x_s;
uniform float u_y_s;
uniform float u_phi_s;
uniform float u_q_s;
uniform float u_index;
uniform float u_r_e;
uniform float u_I_e;

// Flux scale
uniform float u_low_flux;
uniform float u_high_flux;

// Image positions
varying vec2 v_xy;

${sersicFn}

${rescaleClipFluxFn}

${viridisFn}

void main() {
  float flux = sersic(
    v_xy[0],
    v_xy[1],
    u_x_s,
    u_y_s,
    u_phi_s,
    u_q_s,
    u_index,
    u_r_e,
    u_I_e
  );
  float clipped_flux = rescale_clip_flux(flux, u_low_flux, u_high_flux);
  gl_FragColor = vec4(viridis(clipped_flux), 1);
}
`;

/*
 * Ray-traces and evaluates source.
 */
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
uniform float u_lens_light_scale;

// External shear parameters
uniform float u_gamma_1;
uniform float u_gamma_2;

// Subhalo parameters
#define N_SH 10
uniform float u_x_sh[N_SH];
uniform float u_y_sh[N_SH];
uniform float u_rho_s[N_SH];
uniform float u_r_s[N_SH];
uniform float u_tau[N_SH];

// Intermediate flux scale
uniform float u_max_flux;

// Image positions
varying vec2 v_xy;
// varying vec2 v_texcoord; // DEBUG

// Subhalo and lens constants
// TODO: generate shader with correct constants
#define PI radians(180.0)
#define S_MIN 1e-12
#define G_OVER_C2 4.79e-20 // Mpc / MSol
#define Z_SRC 2.5
#define D_A_SRC 1704.8621 // Mpc
#define D_A_LENS 1420.2484 // Mpc
#define D_COMOVING_SRC 5967.0171 // Mpc
#define D_COMOVING_LENS 2272.3975 // Mpc
float dALS = (D_COMOVING_SRC - D_COMOVING_LENS) / (1.0 + Z_SRC);
float Sigma_cr = 1.0 / (4.0 * PI * G_OVER_C2 * D_A_LENS * dALS / D_A_SRC);

float log10(float x) {
  return log(x) / 2.302585093;
}

float acosh(float x) {
  return log(x + sqrt(x * x - 1.0));
}

${sersicFn}

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

vec2 alpha_tnfw(
  float x, float y, float x_sh, float y_sh, float rho_s, float r_s, float tau
) {
  // Convert scale radius to angular scale
  float theta_s = (r_s / D_A_LENS) * ((180.0 / PI) * 60.0 * 60.0); // arcsec

  float dx = x - x_sh;
  float dy = y - y_sh;
  float s = sqrt(dx * dx + dy * dy) / theta_s;
  float f =
    (s >= 1.0 ? acos(1.0 / s) : acosh(1.0 / s)) /
    sqrt(abs(s * s - 1.0));
  float l = log((s + S_MIN) / (sqrt(s * s + tau * tau) + tau));
  float m =
    ((4.0 * PI * tau * tau) / ((tau * tau + 1.0) * (tau * tau + 1.0))) *
    ((tau * tau + 2.0 * s * s - 1.0) * f +
      PI * tau +
      (tau * tau - 1.0) * log(tau) +
      sqrt(s * s + tau * tau) * (((tau * tau - 1.0) / tau) * l - PI));
  float k_s = (rho_s * r_s) / Sigma_cr;

  float alpha_scale = (k_s * m) / PI / ((s + S_MIN) * (s + S_MIN));
  return vec2(alpha_scale * dx, alpha_scale * dy);
}

vec2 alpha_shear(float x, float y) {
  float alpha_x = u_gamma_1 * x + u_gamma_2 * y;
  float alpha_y = u_gamma_1 * x - u_gamma_2 * y;
  return vec2(alpha_x, alpha_y);
}

${rescaleClipFluxFn}

// Rescales the flux to (0, 1) and sets to R component of color
vec4 fluxes_to_rg(float flux, float lens_flux) {
  float clipped_flux = rescale_clip_flux(flux, 0.0, u_max_flux);
  float clipped_lens_flux = rescale_clip_flux(lens_flux, 0.0, u_max_flux);
  return vec4(clipped_flux, clipped_lens_flux, 0, 1);
}

float gaussian_source(
  float x,
  float y,
  float x_s,
  float y_s,
  float phi,
  float q,
  float sigma,
  float norm
) {
  float dx = x - x_s;
  float dy = y - y_s;
  float rx = (dx * cos(phi) + dy * sin(phi)) * sqrt(q);
  float ry = (-dx * sin(phi) + dy * cos(phi)) / sqrt(q);
  float r2 = rx * rx + ry * ry;
  float ang = atan(ry, rx);
  return norm * exp(-r2 / (2.0 * sigma * sigma));
}

void main() {
  // Main lens deflection field
  vec2 alpha = (
    alpha_sie(v_xy[0], v_xy[1])
    + alpha_shear(v_xy[0], v_xy[1])
  );
  // Loop over subhalos
  for (int i = 0; i < N_SH; i++) {
    alpha += alpha_tnfw(
      v_xy[0], v_xy[1], u_x_sh[i], u_y_sh[i], u_rho_s[i], u_r_s[i], u_tau[i]
    );
  }
  // Apply lensing equation
  vec2 xy_lensed = v_xy - alpha;
  // Compute fluxes
  float flux = sersic(
    xy_lensed[0],
    xy_lensed[1],
    u_x_s,
    u_y_s,
    u_phi_s,
    u_q_s,
    u_index,
    u_r_e,
    u_I_e
  );
  // Get lens light
  float lens_flux = u_lens_light_scale > 0.0 ? gaussian_source(
    v_xy[0],
    v_xy[1],
    0.0,
    0.0,
    u_phi_l,
    u_q_l,
    u_r_ein / 1.5,
    u_lens_light_scale
  ) : 0.0;
  // Put flux in r channel and lens_flux in g channel
  gl_FragColor = fluxes_to_rg(flux, lens_flux);

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

/*
 * Postprocessing: pixelates and adds noise.
 */
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

// Flux scale
uniform float u_low_flux;
uniform float u_high_flux;

// Noise scale
uniform float u_noise_range;
uniform float u_sigma_n;

${viridisFn}

float unrescale_flux(float r) {
  return r * u_max_flux;
}

float unrescale_noise(float n) {
  return 2.0 * (n - 0.5) * u_noise_range * u_sigma_n * 0.5;
}

${rescaleClipFluxFn}

vec4 flux_to_noisy_rgba(float flux, float lens_flux) {
  float scaled_noise = texture2D(u_noise_tex, gl_FragCoord.xy / u_n_pix).x;
  float noisy_flux = (
    unrescale_flux(flux)
    + unrescale_flux(lens_flux)
    + unrescale_noise(scaled_noise)
  );
  float clipped_flux = rescale_clip_flux(noisy_flux, u_low_flux, u_high_flux);
  return vec4(viridis(clipped_flux), 1);
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

  source += `
  float avg_lens_flux = (
`;
  for (let i = -range; i <= range; i++) {
    source += "    //\n";
    for (let j = -range; j <= range; j++) {
      // Gets center of texture pixel and adds offset to average over fine
      // texture's pixels
      source +=
        `    texture2D(u_flux_tex, gl_FragCoord.xy / u_n_pix + vec2(${j.toFixed(
          1
        )}, ${i.toFixed(1)}) / u_n_pix_fine).y` +
        (j === range && i === range ? "" : " +") +
        "\n";
    }
  }
  source += `  ) / ${(upsample ** 2).toFixed(1)};\n`;

  source += `  gl_FragColor = flux_to_noisy_rgba(avg_flux, avg_lens_flux);`;
  source += "\n}";

  return source;
};
