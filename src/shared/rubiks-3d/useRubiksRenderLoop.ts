// ASD-STE100 Simplified Technical English comments.
// WebGL2 render loop and animation scheduling hook for 3D Rubik's Cube.

import { useEffect } from "react";
import type { GLProgramContext } from "./gl-shaders.ts";
import { initGLProgram } from "./gl-shaders.ts";
import { createVec3, makeLookAtMatrix, makePerspectiveMatrix, multiplyMat4 } from "./math.ts";
import { computeCameraEye } from "./rubiks-raycast.ts";
import {
  createEmptyDrag,
  type DragState,
  renderCubies,
  settleSliceAnimation,
  setupCubieBuffers,
} from "./rubiks-renderer.ts";
import { DEFAULT_SPRING_CONFIG, stepSpring, type SpringState } from "./spring.ts";
import type { CubeLLMContext, CubieData } from "./state.ts";
import type { OrbitState } from "./useRubiksPointer.ts";

function drawSceneFrame(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  glProg: GLProgramContext,
  cubies: CubieData[],
  vaos: WebGLVertexArrayObject[],
  indexCounts: number[],
  drag: DragState,
  springPosition: number,
  cameraAngle: { yaw: number; pitch: number },
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const displayWidth = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const displayHeight = Math.max(1, Math.round(canvas.clientHeight * dpr));

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    gl.viewport(0, 0, displayWidth, displayHeight);
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl["useProgram"](glProg.program);

  const eye = computeCameraEye(cameraAngle.yaw, cameraAngle.pitch);
  const view = makeLookAtMatrix(eye, createVec3(0, 0, 0), createVec3(0, 1, 0));
  const proj = makePerspectiveMatrix(
    Math.PI / 4,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100,
  );
  const viewProj = multiplyMat4(proj, view);

  gl.uniformMatrix4fv(glProg.uViewProj, false, viewProj.elements);
  gl.uniform3f(glProg.uLightDir, 6.0, 9.0, 5.0);
  gl.uniform3f(glProg.uEyePos, eye.x, eye.y, eye.z);

  renderCubies(gl, cubies, vaos, indexCounts, glProg.uModel, drag, springPosition);
}

function updatePhysicsStep(
  springRef: React.RefObject<SpringState>,
  dragRef: React.RefObject<DragState>,
  cubiesRef: React.RefObject<CubieData[]>,
  moveHistoryRef: React.RefObject<string[]>,
  onContextUpdate?: (context: CubeLLMContext) => void,
  dt = 0.016,
) {
  if (springRef.current.isSettled) return;

  springRef.current = stepSpring(springRef.current, dt, DEFAULT_SPRING_CONFIG);
  if (springRef.current.isSettled) {
    settleSliceAnimation(
      cubiesRef.current,
      dragRef.current,
      springRef.current.target,
      moveHistoryRef.current,
      onContextUpdate,
    );
    dragRef.current = createEmptyDrag();
  }
}

function startAnimationLoop(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  glProg: GLProgramContext,
  cubiesRef: React.RefObject<CubieData[]>,
  moveHistoryRef: React.RefObject<string[]>,
  springRef: React.RefObject<SpringState>,
  dragRef: React.RefObject<DragState>,
  cameraAngleRef: React.RefObject<{ yaw: number; pitch: number }>,
  vaos: WebGLVertexArrayObject[],
  indexCounts: number[],
  onContextUpdate?: (context: CubeLLMContext) => void,
  autoRotateSpeed?: number,
  orbitRef?: React.RefObject<OrbitState>,
): () => void {
  let animId = 0;
  let lastTime = performance.now();

  function renderLoop(currentTime: number) {
    const dt = (currentTime - lastTime) / 1000.0;
    lastTime = currentTime;

    if (autoRotateSpeed && !dragRef.current.active && !orbitRef?.current.active) {
      cameraAngleRef.current.yaw += autoRotateSpeed * dt;
    }

    updatePhysicsStep(springRef, dragRef, cubiesRef, moveHistoryRef, onContextUpdate, dt);
    drawSceneFrame(
      gl,
      canvas,
      glProg,
      cubiesRef.current,
      vaos,
      indexCounts,
      dragRef.current,
      springRef.current.position,
      cameraAngleRef.current,
    );
    animId = requestAnimationFrame(renderLoop);
  }

  animId = requestAnimationFrame(renderLoop);
  return () => cancelAnimationFrame(animId);
}

function initAndRunRubiksLoop(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  cubiesRef: React.RefObject<CubieData[]>,
  moveHistoryRef: React.RefObject<string[]>,
  springRef: React.RefObject<SpringState>,
  dragRef: React.RefObject<DragState>,
  cameraAngleRef: React.RefObject<{ yaw: number; pitch: number }>,
  onContextUpdate?: (context: CubeLLMContext) => void,
  autoRotateSpeed?: number,
  orbitRef?: React.RefObject<OrbitState>,
): (() => void) | null {
  const glProg = initGLProgram(gl);
  if (!glProg) return null;

  const { buffersToCleanup, vaosToCleanup, vaos, indexCounts } = setupCubieBuffers(
    gl,
    cubiesRef.current,
  );
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0.05, 0.06, 0.08, 1.0);

  const cancelLoop = startAnimationLoop(
    gl,
    canvas,
    glProg,
    cubiesRef,
    moveHistoryRef,
    springRef,
    dragRef,
    cameraAngleRef,
    vaos,
    indexCounts,
    onContextUpdate,
    autoRotateSpeed,
    orbitRef,
  );

  return () => {
    cancelLoop();
    for (const vao of vaosToCleanup) gl.deleteVertexArray(vao);
    for (const buf of buffersToCleanup) gl.deleteBuffer(buf);
    gl.deleteProgram(glProg.program);
  };
}

export function useRubiksRenderLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cubiesRef: React.RefObject<CubieData[]>,
  moveHistoryRef: React.RefObject<string[]>,
  springRef: React.RefObject<SpringState>,
  dragRef: React.RefObject<DragState>,
  cameraAngleRef: React.RefObject<{ yaw: number; pitch: number }>,
  onContextUpdate?: (context: CubeLLMContext) => void,
  autoRotateSpeed?: number,
  orbitRef?: React.RefObject<OrbitState>,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
    if (!gl) return;

    return (
      initAndRunRubiksLoop(
        gl,
        canvas,
        cubiesRef,
        moveHistoryRef,
        springRef,
        dragRef,
        cameraAngleRef,
        onContextUpdate,
        autoRotateSpeed,
        orbitRef,
      ) ?? undefined
    );
  }, [
    canvasRef,
    cubiesRef,
    moveHistoryRef,
    springRef,
    dragRef,
    cameraAngleRef,
    onContextUpdate,
    autoRotateSpeed,
    orbitRef,
  ]);
}
