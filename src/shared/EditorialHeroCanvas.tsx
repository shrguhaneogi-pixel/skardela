// ASD-STE100 Simplified Technical English comments.
// This component renders a selective WebGL procedural visual for the daily hero.
// When WebGL is unavailable or when reduced motion is preferred, it uses a clean SVG fallback.

import { useEffect, useRef, useState, type RefObject } from "react";
import styles from "./EditorialHeroCanvas.module.css";

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
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);

  // Subtle wave deflection from pointer
  float distToPointer = length(uv - uPointer);
  float ripple = sin(distToPointer * 18.0 - uTime * 1.5) * 0.02 * exp(-distToPointer * 3.0);
  p += ripple;

  // Dual coordinate grid lines
  vec2 grid = abs(fract(p * 4.0 - 0.5) - 0.5) / fwidth(p * 4.0);
  float line = min(grid.x, grid.y);
  float gridPattern = 1.0 - min(line, 1.0);

  // Center radial compass halo
  float ring = abs(length(p) - 0.85);
  float ringLine = 1.0 - smoothstep(0.0, 0.02, ring);

  // Combine ink base with fine accents
  vec3 col = uColorBg;
  col = mix(col, uColorAccent, gridPattern * 0.14);
  col = mix(col, uColorAccent, ringLine * 0.28);

  fragColor = vec4(col, 1.0);
}
`;

type GlContext = {
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

function initGl(canvas: HTMLCanvasElement): GlContext | null {
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
  // Full-screen triangle quad
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
  const width = Math.floor(canvas.clientWidth * dpr);
  const height = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    return true;
  }
  return false;
}

function renderFrame(
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
  // Amber accent colour.
  gl.uniform3f(locations.accent, 0.98, 0.57, 0.23);
  // Ink base colour.
  gl.uniform3f(locations.bg, 0.06, 0.07, 0.1);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function useWebGlAnimation(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  pointerRef: RefObject<[number, number]>,
) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = initGl(canvas);
    if (!ctx) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animId = 0;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      renderFrame(ctx, canvas, elapsed, pointerRef.current);
      if (!prefersReduce) {
        animId = requestAnimationFrame(loop);
      }
    };

    renderFrame(ctx, canvas, 0, pointerRef.current);
    if (!prefersReduce) {
      animId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animId);
      ctx.gl.deleteBuffer(ctx.buffer);
      ctx.gl.deleteProgram(ctx.program);
    };
  }, [canvasRef, pointerRef]);

  return isSupported;
}

function FallbackSvg() {
  return (
    <svg
      className={styles.fallbackSvg}
      viewBox="0 0 400 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="editorial-grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1" fill="var(--accent)" opacity="0.3" />
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#editorial-grid-pattern)" />
      <circle
        cx="200"
        cy="80"
        r="48"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.4"
      />
      <line
        x1="200"
        y1="20"
        x2="200"
        y2="140"
        stroke="var(--border)"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1="120"
        y1="80"
        x2="280"
        y2="80"
        stroke="var(--border)"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  );
}

export function EditorialHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<[number, number]>([0.5, 0.5]);
  const isSupported = useWebGlAnimation(canvasRef, pointerRef);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const px = (e.clientX - rect.left) / rect.width;
      const py = 1.0 - (e.clientY - rect.top) / rect.height;
      pointerRef.current = [px, py];
    }
  }

  return (
    <div className={styles.heroGraphicWrapper} onPointerMove={handlePointerMove} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      {!isSupported && <FallbackSvg />}
      <div className={styles.overlayReticle}>
        <div className={styles.cornerMarks} />
        <span>SYS.CHRONICLE // SPEC 01</span>
        <span>LAB COORDINATE MATRIX</span>
      </div>
    </div>
  );
}
