const vertexShaderSource = `
attribute vec2 a_position;

uniform float u_range;
uniform vec2 u_translation;

varying vec2 v_xy;
varying vec2 v_texcoord;

void main() {
  gl_PointSize = 1.0;
  v_xy = a_position * u_range; // image coordinates
  v_texcoord = a_position * 0.5 + 0.5; // texture coordinates
  gl_Position = vec4(a_position, 0, 1);
}
`;

export default vertexShaderSource;
