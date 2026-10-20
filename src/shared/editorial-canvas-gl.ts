// ASD-STE100 Simplified Technical English comments.
// WebGL context and shader utilities for the editorial hero visual.

const VERTEX_SHADER_SRC = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
uniform vec3 uColorAccent;
uniform vec3 uColorBg;

void main() {
  vec2 uv = gl_FragCoord.xy / max(uResolution.xy, vec2(1.0));
  vec2 p = (gl_FragCoord.xy * 2.0 - uResolution.xy) / max(min(uResolution.x, uResolution.y), 1.0);

  // Subtle wave deflection from pointer
  float distToPointer = length(uv - uPointer);
  float ripple = sin(distToPointer * 18.0 - uTime * 1.5) * 0.02 * exp(-distToPointer * 3.0);
  p += ripple;

  // Dual coordinate grid lines with safe derivatives
  vec2 fw = max(fwidth(p * 4.0), vec2(0.001));
  vec2 grid = abs(fract(p * 4.0 - 0.5) - 0.5) / fw;
  float line = min(grid.x, grid.y);
  float gridPattern = 1.0 - min(line, 1.0);

  // Center radial compass halo
  float ring = abs(length(p) - 0.85);
  float ringLine = 1.0 - smoothstep(0.0, 0.02, ring);

  // Combine base with fine accents
  vec3 col = uColorBg;
  col = mix(col, uColorAccent, gridPattern * 0.14);
  col = mix(col, uColorAccent, ringLine * 0.28);

  fragColor = vec4(col, 1.0);
}
`;

export type GlContext = {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  locations: {
    resolution: WebGLUniformLocation | null;
    pointer: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    accent: WebGLUniformLocation | null;
    bg: WebGLUniformLocation | null;
  };
};

function createShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
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

export function initGl(canvas: HTMLCanvasElement): GlContext | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
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

  const buffer = gl.createBuffer();
  if (!buffer) return null;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  return {
    gl,
    program,
    buffer,
    locations: {
      resolution: gl.getUniformLocation(program, "uResolution"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      time: gl.getUniformLocation(program, "uTime"),
      accent: gl.getUniformLocation(program, "uColorAccent"),
      bg: gl.getUniformLocation(program, "uColorBg"),
    },
  };
}

function resizeCanvas(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext): boolean {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor((canvas.clientWidth || 300) * dpr));
  const height = Math.max(1, Math.floor((canvas.clientHeight || 120) * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    return true;
  }
  return false;
}

function isDarkTheme(): boolean {
  if (typeof document === "undefined") return false;
  const theme = document.documentElement.dataset.theme;
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function renderHeroFrame(
  ctx: GlContext,
  canvas: HTMLCanvasElement,
  timeSec: number,
  pointer: [number, number],
) {
  const { gl, program, locations } = ctx;
  resizeCanvas(canvas, gl);
  gl.useProgram(program);

  gl.uniform2f(locations.resolution, canvas.width, canvas.height);
  gl.uniform2f(locations.pointer, pointer[0], pointer[1]);
  gl.uniform1f(locations.time, timeSec);

  if (isDarkTheme()) {
    gl.uniform3f(locations.accent, 0.98, 0.57, 0.23);
    gl.uniform3f(locations.bg, 0.05, 0.06, 0.08);
  } else {
    gl.uniform3f(locations.accent, 0.76, 0.25, 0.05);
    gl.uniform3f(locations.bg, 0.97, 0.98, 0.98);
  }

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function setupIntersectionObserver(
  canvas: HTMLCanvasElement,
  onVisibilityChange: (visible: boolean) => void,
): () => void {
  if (!("IntersectionObserver" in window)) return () => {};
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry) onVisibilityChange(entry.isIntersecting);
    },
    { threshold: 0.05 },
  );
  observer.observe(canvas);
  return () => observer.disconnect();
}

export function setupContextListeners(
  canvas: HTMLCanvasElement,
  onLost: () => void,
  onRestored: (newCtx: GlContext | null) => void,
): () => void {
  const handleLost = (event: Event) => {
    event.preventDefault();
    onLost();
  };
  const handleRestored = () => {
    onRestored(initGl(canvas));
  };
  canvas.addEventListener("webglcontextlost", handleLost);
  canvas.addEventListener("webglcontextrestored", handleRestored);
  return () => {
    canvas.removeEventListener("webglcontextlost", handleLost);
    canvas.removeEventListener("webglcontextrestored", handleRestored);
  };
}

function startAnimation(
  ctx: GlContext,
  canvas: HTMLCanvasElement,
  pointerRef: { readonly current: [number, number] },
) {
  let animId = 0;
  let isVisible = true;
  const startTime = performance.now();
  const loop = (now: number) => {
    if (!isVisible) return;
    renderHeroFrame(ctx, canvas, (now - startTime) * 0.001, pointerRef.current);
    animId = requestAnimationFrame(loop);
  };
  renderHeroFrame(ctx, canvas, 0, pointerRef.current);
  animId = requestAnimationFrame(loop);

  return {
    stop: () => cancelAnimationFrame(animId),
    restart: () => {
      cancelAnimationFrame(animId);
      if (isVisible) animId = requestAnimationFrame(loop);
    },
    setVisible: (v: boolean) => {
      isVisible = v;
      cancelAnimationFrame(animId);
      if (v) animId = requestAnimationFrame(loop);
    },
  };
}

export function runWebGlLoop(
  canvas: HTMLCanvasElement,
  pointerRef: { readonly current: [number, number] },
): () => void {
  if (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    canvas.dataset.active = "false";
    return () => {};
  }
  let ctx = initGl(canvas);
  if (!ctx) {
    canvas.dataset.active = "false";
    return () => {};
  }
  canvas.dataset.active = "true";

  let runner = startAnimation(ctx, canvas, pointerRef);

  const cleanupObs = setupIntersectionObserver(canvas, (visible) => runner.setVisible(visible));
  const cleanupCtx = setupContextListeners(
    canvas,
    () => {
      canvas.dataset.active = "false";
      runner.stop();
    },
    (restored) => {
      if (restored) {
        ctx = restored;
        canvas.dataset.active = "true";
        runner = startAnimation(restored, canvas, pointerRef);
      }
    },
  );

  return () => {
    runner.stop();
    cleanupObs();
    cleanupCtx();
    if (ctx) {
      ctx.gl.deleteBuffer(ctx.buffer);
      ctx.gl.deleteProgram(ctx.program);
    }
  };
}
