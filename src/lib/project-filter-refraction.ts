import { filterGlyphs } from "@/lib/project-filter-glyphs";
import { projectFilters } from "@/lib/project-filters";

const sourcePadding = 24;
const lensInsetX = 4;
const lensInsetY = 8;

const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
}
`;

const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D u_icons;
uniform vec2 u_center;
uniform vec2 u_size;
uniform float u_strength;
varying vec2 v_uv;

void main() {
  vec2 offset = v_uv - u_center;
  float radius = length(offset / u_size * 2.0);
  float innerSlope = smoothstep(0.24, 0.76, radius);
  float outerSlope = 1.0 - smoothstep(0.78, 0.98, radius);
  float bending = 0.27 * innerSlope * outerSlope * u_strength;
  vec2 samplePoint = v_uv - offset * (bending / max(radius, 0.001));
  float ink = texture2D(u_icons, samplePoint).a;
  gl_FragColor = vec4(vec3(0.15, 0.32, 0.36) * ink, ink);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

export function createFilterRefraction(output: HTMLCanvasElement) {
  const gl = output.getContext("webgl", { alpha: true, antialias: false });
  if (!gl) return null;

  const program = gl.createProgram();
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const texture = gl.createTexture();
  const buffer = gl.createBuffer();
  const source = document.createElement("canvas");
  const sourceContext = source.getContext("2d");
  const destroy = () => {
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.deleteProgram(program);
  };
  if (!program || !vertex || !fragment || !texture || !buffer || !sourceContext) {
    destroy();
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    destroy();
    return null;
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const positionAttribute = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttribute);
  gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program, "u_icons"), 0);
  const centerUniform = gl.getUniformLocation(program, "u_center");
  const sizeUniform = gl.getUniformLocation(program, "u_size");
  const strengthUniform = gl.getUniformLocation(program, "u_strength");

  let trackWidth = 0;
  let trackHeight = 0;
  let segmentWidth = 0;
  let sourceWidth = 0;
  let sourceHeight = 0;

  const resize = (width: number, height: number) => {
    if (width <= 0 || height <= 0 || (width === trackWidth && height === trackHeight)) return;
    trackWidth = width;
    trackHeight = height;
    segmentWidth = width / projectFilters.length;
    sourceWidth = width + sourcePadding * 2;
    sourceHeight = height + sourcePadding * 2;
    const density = Math.min(window.devicePixelRatio || 1, 2);
    source.width = Math.ceil(sourceWidth * density);
    source.height = Math.ceil(sourceHeight * density);
    output.width = source.width;
    output.height = source.height;

    sourceContext.scale(source.width / sourceWidth, source.height / sourceHeight);
    sourceContext.strokeStyle = "#263e44";
    sourceContext.lineWidth = 1.65;
    sourceContext.lineCap = "round";
    sourceContext.lineJoin = "round";
    for (const [index, filter] of projectFilters.entries()) {
      sourceContext.save();
      sourceContext.translate(
        sourcePadding + segmentWidth * (index + 0.5) - 10,
        sourcePadding + height / 2 - 10,
      );
      sourceContext.scale(20 / 24, 20 / 24);
      sourceContext.stroke(new Path2D(filterGlyphs[filter]));
      sourceContext.restore();
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  };

  const draw = (position: number, scale: number) => {
    if (!trackWidth || gl.isContextLost()) return false;
    gl.viewport(0, 0, output.width, output.height);
    gl.uniform2f(
      centerUniform,
      (sourcePadding + segmentWidth * (position + 0.5)) / sourceWidth,
      0.5,
    );
    gl.uniform2f(
      sizeUniform,
      ((segmentWidth + lensInsetX * 2) * scale) / sourceWidth,
      ((trackHeight + lensInsetY * 2) * scale) / sourceHeight,
    );
    gl.uniform1f(strengthUniform, Math.max(0, Math.min(1, (scale - 1.06) / 0.32)));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  };

  return { resize, draw, destroy };
}
