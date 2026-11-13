// ASD-STE100 Simplified Technical English comments.
// WebGL2 CRT post-processing shader pipeline and context management.
// Implements barrel distortion, chromatic aberration, scanlines, vignette, and Bayer dithering.

const CRT_VS = `#version 300 es
layout(location = 0) in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const CRT_FS = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform float uPowerOn;

// 8x8 Bayer dithering matrix
const float bayer8[64] = float[64](
   0.0/64.0, 32.0/64.0,  8.0/64.0, 40.0/64.0,  2.0/64.0, 34.0/64.0, 10.0/64.0, 42.0/64.0,
  48.0/64.0, 16.0/64.0, 56.0/64.0, 24.0/64.0, 50.0/64.0, 18.0/64.0, 58.0/64.0, 26.0/64.0,
  12.0/64.0, 44.0/64.0,  4.0/64.0, 36.0/64.0, 14.0/64.0, 46.0/64.0,  6.0/64.0, 38.0/64.0,
  60.0/64.0, 28.0/64.0, 52.0/64.0, 20.0/64.0, 62.0/64.0, 30.0/64.0, 54.0/64.0, 22.0/64.0,
   3.0/64.0, 35.0/64.0, 11.0/64.0, 43.0/64.0,  1.0/64.0, 33.0/64.0,  9.0/64.0, 41.0/64.0,
  51.0/64.0, 19.0/64.0, 59.0/64.0, 27.0/64.0, 49.0/64.0, 17.0/64.0, 57.0/64.0, 25.0/64.0,
  15.0/64.0, 47.0/64.0,  7.0/64.0, 39.0/64.0, 13.0/64.0, 45.0/64.0,  5.0/64.0, 37.0/64.0,
  63.0/64.0, 31.0/64.0, 55.0/64.0, 23.0/64.0, 61.0/64.0, 29.0/64.0, 53.0/64.0, 21.0/64.0
);

vec2 curve(vec2 uv) {
  uv = (uv - 0.5) * 2.0;
  uv.x *= 1.0 + pow(abs(uv.y) * 0.18, 2.0);
  uv.y *= 1.0 + pow(abs(uv.x) * 0.18, 2.0);
  return uv * 0.5 + 0.5;
}

void main() {
  vec2 uv = curve(vUv);

  // Black outside the curved screen boundaries
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    fragColor = vec4(0.01, 0.01, 0.02, 1.0);
    return;
  }

  // Shader-driven CRT power-on snap opening animation
  float power = clamp(uPowerOn, 0.001, 1.0);
  float distFromCenter = abs(uv.y - 0.5);
  if (distFromCenter > (power * 0.5)) {
    float edgeGlow = smoothstep(power * 0.5 + 0.02, power * 0.5, distFromCenter) * 0.8;
    fragColor = vec4(vec3(edgeGlow), 1.0);
    return;
  }

  // Base arcade vibrant palette (magenta, cyan, deep violet)
  vec3 baseCol = vec3(
    0.15 + 0.12 * sin(uv.x * 6.28 + uTime * 0.5),
    0.12 + 0.10 * cos(uv.y * 6.28 - uTime * 0.4),
    0.28 + 0.18 * sin((uv.x + uv.y) * 3.14 + uTime * 0.6)
  );

  // Chromatic aberration
  float shift = 0.004 * (1.0 + 0.5 * sin(uTime * 3.0));
  float r = baseCol.r + 0.08 * sin((uv.x + shift) * 20.0);
  float g = baseCol.g;
  float b = baseCol.b + 0.08 * cos((uv.x - shift) * 20.0);
  vec3 col = vec3(r, g, b);

  // Dynamic horizontal scanlines
  float scanline = sin(uv.y * uResolution.y * 1.8 + uTime * 6.0) * 0.06;
  col -= scanline;

  // Deep vignette
  float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
  float vignette = clamp(pow(16.0 * vig, 0.35), 0.0, 1.0);
  col *= vignette;

  // 8x8 Bayer dithering
  int x = int(mod(gl_FragCoord.x, 8.0));
  int y = int(mod(gl_FragCoord.y, 8.0));
  float threshold = bayer8[y * 8 + x] - 0.5;
  col += (threshold * 0.04);

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export interface CrtGlContext {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  vao: WebGLVertexArrayObject;
  locations: {
    resolution: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    powerOn: WebGLUniformLocation | null;
  };
}

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createCrtProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, CRT_VS);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, CRT_FS);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function createCrtQuad(
  gl: WebGL2RenderingContext,
): { vao: WebGLVertexArrayObject; buffer: WebGLBuffer } | null {
  const vao = gl.createVertexArray();
  const buffer = gl.createBuffer();
  if (!vao || !buffer) return null;

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  return { vao, buffer };
}

export function initCrtGl(canvas: HTMLCanvasElement): CrtGlContext | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const program = createCrtProgram(gl);
  if (!program) return null;

  const quad = createCrtQuad(gl);
  if (!quad) {
    gl.deleteProgram(program);
    return null;
  }

  return {
    gl,
    program,
    buffer: quad.buffer,
    vao: quad.vao,
    locations: {
      resolution: gl.getUniformLocation(program, "uResolution"),
      time: gl.getUniformLocation(program, "uTime"),
      powerOn: gl.getUniformLocation(program, "uPowerOn"),
    },
  };
}

export function renderCrtFrame(ctx: CrtGlContext, canvas: HTMLCanvasElement, timeSec: number) {
  const { gl, program, vao, locations } = ctx;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.floor((canvas.clientWidth || 320) * dpr));
  const h = Math.max(1, Math.floor((canvas.clientHeight || 240) * dpr));

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  gl.useProgram(program);
  gl.bindVertexArray(vao);
  if (locations.resolution) gl.uniform2f(locations.resolution, canvas.width, canvas.height);
  if (locations.time) gl.uniform1f(locations.time, timeSec);

  // Power-on snaps open over first 1.2 seconds
  const power = Math.min(1.0, timeSec / 1.2);
  if (locations.powerOn) gl.uniform1f(locations.powerOn, power);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function cleanupCrtGl(ctx: CrtGlContext) {
  const { gl, program, buffer, vao } = ctx;
  gl.deleteBuffer(buffer);
  gl.deleteVertexArray(vao);
  gl.deleteProgram(program);
}
