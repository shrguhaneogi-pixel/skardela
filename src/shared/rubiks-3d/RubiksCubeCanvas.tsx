// ASD-STE100 Simplified Technical English comments.
// Pure WebGL2 3D Rubik's Cube component with zero external runtime dependencies.
// Solvable by rotating cubies through mouse spatial drag vectors. Fully synchronized with LLM context.

import React, { useEffect, useRef, useCallback } from "react";
import {
  addVec3,
  cleanCubiePosition,
  createIdentityMat4,
  createVec3,
  crossVec3,
  dotVec2,
  dotVec3,
  evaluateDragKinematics,
  identifySliceIndices,
  makeLookAtMatrix,
  makePerspectiveMatrix,
  multiplyMat4,
  multiplyQuaternions,
  normalizeVec3,
  quaternionFromAxisAngle,
  rotateVec3ByQuaternion,
  snapQuaternionToOrtho,
  subVec3,
  type Mat4,
  type Vec2,
  type Vec3,
} from "./math.ts";
import {
  computeSnapAngle,
  createSpringState,
  DEFAULT_SPRING_CONFIG,
  stepSpring,
  VelocityTracker,
  type SpringState,
} from "./spring.ts";
import {
  applyMoveToCubies,
  CUBE_PALETTE,
  evaluateCubeState,
  extractFacelets54,
  generateInitialCubies,
  generateRandomScramble,
  getSingmasterMove,
  parseSingmasterMove,
  type CubeLLMContext,
  type CubieData,
  type FaceName,
} from "./state.ts";

export interface RubiksCubeCanvasProps {
  onContextUpdate?: (context: CubeLLMContext) => void;
  className?: string;
  autoRotateSpeed?: number;
  scrambleSignal?: number;
  resetSignal?: number;
}

const VS_SRC = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec3 aColor;

uniform mat4 uViewProj;
uniform mat4 uModel;

out vec3 vNormal;
out vec3 vColor;
out vec3 vWorldPos;

void main() {
  vec4 worldPos = uModel * vec4(aPosition, 1.0);
  vWorldPos = worldPos.xyz;
  vNormal = mat3(uModel) * aNormal;
  vColor = aColor;
  gl_Position = uViewProj * worldPos;
}
`;

const FS_SRC = `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vColor;
in vec3 vWorldPos;

uniform vec3 uLightDir;
uniform vec3 uEyePos;

out vec4 fragColor;

void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(uEyePos - vWorldPos);
  vec3 H = normalize(L + V);

  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 32.0) * 0.25;
  vec3 ambient = vec3(0.22, 0.24, 0.28);

  vec3 col = vColor * (ambient + diff * 0.8) + vec3(spec);
  fragColor = vec4(col, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

// Build geometry for a single unit cubie with 6 colored facelet stickers.
function buildCubieGeometry(initPos: Vec3): {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint16Array;
} {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const coreRgb: [number, number, number] = [0.08, 0.09, 0.11];
  const half = 0.47;

  const faces: { dir: Vec3; norm: [number, number, number]; faceName: FaceName; condition: boolean }[] = [
    { dir: createVec3(0, 1, 0), norm: [0, 1, 0], faceName: "U", condition: initPos.y === 1 },
    { dir: createVec3(0, -1, 0), norm: [0, -1, 0], faceName: "D", condition: initPos.y === -1 },
    { dir: createVec3(1, 0, 0), norm: [1, 0, 0], faceName: "R", condition: initPos.x === 1 },
    { dir: createVec3(-1, 0, 0), norm: [-1, 0, 0], faceName: "L", condition: initPos.x === -1 },
    { dir: createVec3(0, 0, 1), norm: [0, 0, 1], faceName: "F", condition: initPos.z === 1 },
    { dir: createVec3(0, 0, -1), norm: [0, 0, -1], faceName: "B", condition: initPos.z === -1 },
  ];

  let vertCount = 0;

  for (const f of faces) {
    const color = f.condition ? hexToRgb(CUBE_PALETTE[f.faceName].hex) : coreRgb;
    const n = f.norm;

    let corners: [number, number, number][] = [];
    if (f.norm[0] === 1) {
      corners = [[half, -half, half], [half, -half, -half], [half, half, -half], [half, half, half]];
    } else if (f.norm[0] === -1) {
      corners = [[-half, -half, -half], [-half, -half, half], [-half, half, half], [-half, half, -half]];
    } else if (f.norm[1] === 1) {
      corners = [[-half, half, half], [half, half, half], [half, half, -half], [-half, half, -half]];
    } else if (f.norm[1] === -1) {
      corners = [[-half, -half, -half], [half, -half, -half], [half, -half, half], [-half, -half, half]];
    } else if (f.norm[2] === 1) {
      corners = [[-half, -half, half], [half, -half, half], [half, half, half], [-half, half, half]];
    } else {
      corners = [[half, -half, -half], [-half, -half, -half], [-half, half, -half], [half, half, -half]];
    }

    for (const c of corners) {
      positions.push(...c);
      normals.push(...n);
      colors.push(...color);
    }

    indices.push(vertCount, vertCount + 1, vertCount + 2, vertCount, vertCount + 2, vertCount + 3);
    vertCount += 4;
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices),
  };
}

export function RubiksCubeCanvas({
  onContextUpdate,
  className,
  scrambleSignal,
  resetSignal,
}: RubiksCubeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cubiesRef = useRef<CubieData[]>(generateInitialCubies());
  const moveHistoryRef = useRef<string[]>([]);
  const springRef = useRef<SpringState>(createSpringState(0));
  const velocityTrackerRef = useRef(new VelocityTracker());

  // Kinematic drag interaction state.
  const dragRef = useRef<{
    active: boolean;
    isLocked: boolean;
    startScreen: Vec2;
    hitPoint: Vec3;
    normal: Vec3;
    clickedCubieIndex: number;
    rotationAxis: Vec3 | null;
    screenTangent: Vec2 | null;
    sliceIndices: number[];
  }>({
    active: false,
    isLocked: false,
    startScreen: { x: 0, y: 0 },
    hitPoint: createVec3(),
    normal: createVec3(),
    clickedCubieIndex: -1,
    rotationAxis: null,
    screenTangent: null,
    sliceIndices: [],
  });

  // Camera orientation angles.
  const cameraAngleRef = useRef({ yaw: 0.78, pitch: 0.58 });

  // Orbit navigation state for empty space drags.
  const orbitRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startYaw: number;
    startPitch: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    startYaw: 0,
    startPitch: 0,
  });

  // Handle external scramble signal.
  useEffect(() => {
    if (scrambleSignal === undefined || scrambleSignal === 0) return;
    const scramble = generateRandomScramble(20);
    let current = cubiesRef.current;
    for (const moveStr of scramble) {
      const parsed = parseSingmasterMove(moveStr);
      if (parsed) {
        current = applyMoveToCubies(current, parsed.axis, parsed.layer, parsed.angle);
      }
    }
    cubiesRef.current = current;
    moveHistoryRef.current = [...scramble];
    const facelets = extractFacelets54(current);
    const last = scramble[scramble.length - 1];
    const context = evaluateCubeState(facelets, moveHistoryRef.current, last ?? null);
    if (onContextUpdate) {
      onContextUpdate(context);
    }
  }, [scrambleSignal, onContextUpdate]);

  // Handle external reset signal.
  useEffect(() => {
    if (resetSignal === undefined || resetSignal === 0) return;
    const initial = generateInitialCubies();
    cubiesRef.current = initial;
    moveHistoryRef.current = [];
    springRef.current = createSpringState(0);
    const facelets = extractFacelets54(initial);
    const context = evaluateCubeState(facelets, [], null);
    if (onContextUpdate) {
      onContextUpdate(context);
    }
  }, [resetSignal, onContextUpdate]);

  // Raycast face picker: test all 27 cubies with exact entering slab normals.
  const pickCubie = useCallback((screenX: number, screenY: number, width: number, height: number) => {
    const ndcX = (screenX / width) * 2.0 - 1.0;
    const ndcY = 1.0 - (screenY / height) * 2.0;

    const yaw = cameraAngleRef.current.yaw;
    const pitch = cameraAngleRef.current.pitch;
    const eye = createVec3(
      6.2 * Math.cos(yaw) * Math.cos(pitch),
      6.2 * Math.sin(pitch),
      6.2 * Math.sin(yaw) * Math.cos(pitch),
    );
    const target = createVec3(0, 0, 0);
    const forward = normalizeVec3(subVec3(target, eye));
    const right = normalizeVec3(crossVec3(forward, createVec3(0, 1, 0)));
    const up = normalizeVec3(crossVec3(right, forward));

    const aspect = width / height;
    const tanFov = Math.tan((Math.PI / 4) * 0.5);
    const rayDir = normalizeVec3({
      x: forward.x + right.x * ndcX * tanFov * aspect + up.x * ndcY * tanFov,
      y: forward.y + right.y * ndcX * tanFov * aspect + up.y * ndcY * tanFov,
      z: forward.z + right.z * ndcX * tanFov * aspect + up.z * ndcY * tanFov,
    });

    let bestDist = Infinity;
    let bestCubieIndex = -1;
    let bestNormal = createVec3(0, 1, 0);
    let bestHitPoint = createVec3();

    for (let i = 0; i < cubiesRef.current.length; i++) {
      const cubie = cubiesRef.current[i];
      if (!cubie) continue;
      const p = cubie.currentPosition;
      const min = { x: p.x - 0.48, y: p.y - 0.48, z: p.z - 0.48 };
      const max = { x: p.x + 0.48, y: p.y + 0.48, z: p.z + 0.48 };

      const t1 = (min.x - eye.x) / (rayDir.x || 1e-6);
      const t2 = (max.x - eye.x) / (rayDir.x || 1e-6);
      const t3 = (min.y - eye.y) / (rayDir.y || 1e-6);
      const t4 = (max.y - eye.y) / (rayDir.y || 1e-6);
      const t5 = (min.z - eye.z) / (rayDir.z || 1e-6);
      const t6 = (max.z - eye.z) / (rayDir.z || 1e-6);

      const tminX = Math.min(t1, t2);
      const tmaxX = Math.max(t1, t2);
      const tminY = Math.min(t3, t4);
      const tmaxY = Math.max(t3, t4);
      const tminZ = Math.min(t5, t6);
      const tmaxZ = Math.max(t5, t6);

      const tmin = Math.max(tminX, tminY, tminZ);
      const tmax = Math.min(tmaxX, tmaxY, tmaxZ);

      if (tmax >= tmin && tmin > 0 && tmin < bestDist) {
        let norm: Vec3;
        if (tmin === tminX) {
          norm = { x: rayDir.x < 0 ? 1 : -1, y: 0, z: 0 };
        } else if (tmin === tminY) {
          norm = { x: 0, y: rayDir.y < 0 ? 1 : -1, z: 0 };
        } else {
          norm = { x: 0, y: 0, z: rayDir.z < 0 ? 1 : -1 };
        }

        // Only accept exterior faces of the 3x3x3 cube.
        const outer = addVec3(p, norm);
        if (Math.abs(outer.x) > 1.2 || Math.abs(outer.y) > 1.2 || Math.abs(outer.z) > 1.2) {
          bestDist = tmin;
          bestCubieIndex = i;
          bestNormal = norm;
          bestHitPoint = {
            x: eye.x + rayDir.x * tmin,
            y: eye.y + rayDir.y * tmin,
            z: eye.z + rayDir.z * tmin,
          };
        }
      }
    }

    if (bestCubieIndex >= 0) {
      return {
        cubieIndex: bestCubieIndex,
        normal: bestNormal,
        hitPoint: bestHitPoint,
      };
    }
    return null;
  }, []);

  // WebGL render loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
    if (!gl) return;

    function createShader(type: number, src: string): WebGLShader | null {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, VS_SRC);
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    const uViewProj = gl.getUniformLocation(program, "uViewProj");
    const uModel = gl.getUniformLocation(program, "uModel");
    const uLightDir = gl.getUniformLocation(program, "uLightDir");
    const uEyePos = gl.getUniformLocation(program, "uEyePos");

    // Track buffers and VAOs for safe GPU cleanup.
    const buffersToCleanup: WebGLBuffer[] = [];
    const vaosToCleanup: WebGLVertexArrayObject[] = [];
    const cubies = cubiesRef.current;
    const vaos: WebGLVertexArrayObject[] = [];
    const indexCounts: number[] = [];

    for (const cubie of cubies) {
      const geo = buildCubieGeometry(cubie.initialPosition);
      const vao = gl.createVertexArray();
      if (!vao) continue;
      vaosToCleanup.push(vao);
      gl.bindVertexArray(vao);

      const posBuf = gl.createBuffer();
      if (posBuf) {
        buffersToCleanup.push(posBuf);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, geo.positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      }

      const normBuf = gl.createBuffer();
      if (normBuf) {
        buffersToCleanup.push(normBuf);
        gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
        gl.bufferData(gl.ARRAY_BUFFER, geo.normals, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
      }

      const colBuf = gl.createBuffer();
      if (colBuf) {
        buffersToCleanup.push(colBuf);
        gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
        gl.bufferData(gl.ARRAY_BUFFER, geo.colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
      }

      const idxBuf = gl.createBuffer();
      if (idxBuf) {
        buffersToCleanup.push(idxBuf);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);
      }

      vaos.push(vao);
      indexCounts.push(geo.indices.length);
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.05, 0.06, 0.08, 1.0);

    let animId = 0;
    let lastTime = performance.now();

    function renderLoop(currentTime: number) {
      const dt = (currentTime - lastTime) / 1000.0;
      lastTime = currentTime;

      // Step spring physics if animating.
      if (!springRef.current.isSettled) {
        springRef.current = stepSpring(springRef.current, dt, DEFAULT_SPRING_CONFIG);

        // Snap animation settled: bake new matrices into cubie components.
        if (springRef.current.isSettled) {
          const drag = dragRef.current;
          if (drag.rotationAxis && drag.sliceIndices.length > 0) {
            const snapAngle = springRef.current.target;
            const qSnap = quaternionFromAxisAngle(drag.rotationAxis, snapAngle);

            for (const idx of drag.sliceIndices) {
              const c = cubiesRef.current[idx];
              if (!c) continue;
              const rotatedPos = rotateVec3ByQuaternion(c.currentPosition, qSnap);
              const cleanPos = cleanCubiePosition(rotatedPos);
              const newQuat = multiplyQuaternions(qSnap, c.quaternion);
              const snappedQuat = snapQuaternionToOrtho(newQuat);

              c.currentPosition = cleanPos;
              c.quaternion = snappedQuat;
            }

            // Identify Singmaster move notation if a turn occurred.
            const clickedCubie = cubiesRef.current[drag.clickedCubieIndex];
            if (clickedCubie && Math.abs(snapAngle) >= Math.PI * 0.2) {
              const layer = Math.round(dotVec3(clickedCubie.currentPosition, drag.rotationAxis));
              const moveName = getSingmasterMove(drag.rotationAxis, layer, snapAngle);
              if (moveName) {
                moveHistoryRef.current.push(moveName);
              }

              const facelets = extractFacelets54(cubiesRef.current);
              const evalContext = evaluateCubeState(facelets, moveHistoryRef.current, moveName || null);
              if (onContextUpdate) {
                onContextUpdate(evalContext);
              }
            }

            // Reset drag interaction.
            dragRef.current = {
              active: false,
              isLocked: false,
              startScreen: { x: 0, y: 0 },
              hitPoint: createVec3(),
              normal: createVec3(),
              clickedCubieIndex: -1,
              rotationAxis: null,
              screenTangent: null,
              sliceIndices: [],
            };
          }
        }
      }

      // Handle canvas resize with high-DPI scaling.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = Math.max(1, Math.round(canvas!.clientWidth * dpr));
      const displayHeight = Math.max(1, Math.round(canvas!.clientHeight * dpr));

      if (canvas!.width !== displayWidth || canvas!.height !== displayHeight) {
        canvas!.width = displayWidth;
        canvas!.height = displayHeight;
        gl!.viewport(0, 0, displayWidth, displayHeight);
      }

      gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);
      gl!.useProgram(program);

      // Camera view-projection.
      const yaw = cameraAngleRef.current.yaw;
      const pitch = cameraAngleRef.current.pitch;
      const eye = createVec3(
        6.2 * Math.cos(yaw) * Math.cos(pitch),
        6.2 * Math.sin(pitch),
        6.2 * Math.sin(yaw) * Math.cos(pitch),
      );
      const target = createVec3(0, 0, 0);
      const view = makeLookAtMatrix(eye, target, createVec3(0, 1, 0));
      const proj = makePerspectiveMatrix((Math.PI / 4), canvas!.clientWidth / canvas!.clientHeight, 0.1, 100);
      const viewProj = multiplyMat4(proj, view);

      gl!.uniformMatrix4fv(uViewProj, false, viewProj.elements);
      gl!.uniform3f(uLightDir, 6.0, 9.0, 5.0);
      gl!.uniform3f(uEyePos, eye.x, eye.y, eye.z);

      // Active rotation quaternion for rotating slice.
      const drag = dragRef.current;
      const isSliceRotating = drag.rotationAxis && drag.sliceIndices.length > 0;
      const activeAngle = isSliceRotating ? springRef.current.position : 0;
      const activeSliceQuat = isSliceRotating && drag.rotationAxis
        ? quaternionFromAxisAngle(drag.rotationAxis, activeAngle)
        : { x: 0, y: 0, z: 0, w: 1 };

      // Render all 27 cubies.
      for (let i = 0; i < cubiesRef.current.length; i++) {
        const c = cubiesRef.current[i];
        const vao = vaos[i];
        const count = indexCounts[i];
        if (!c || !vao || count === undefined) continue;

        const isSelectedSlice = isSliceRotating && drag.sliceIndices.includes(i);

        let finalPos = c.currentPosition;
        let finalQuat = c.quaternion;

        if (isSelectedSlice) {
          finalPos = rotateVec3ByQuaternion(c.currentPosition, activeSliceQuat);
          finalQuat = multiplyQuaternions(activeSliceQuat, c.quaternion);
        }

        const model = createIdentityMat4();
        const me = model.elements;
        const qx = finalQuat.x, qy = finalQuat.y, qz = finalQuat.z, qw = finalQuat.w;

        me[0] = 1 - 2 * (qy * qy + qz * qz);
        me[1] = 2 * (qx * qy + qz * qw);
        me[2] = 2 * (qx * qz - qy * qw);

        me[4] = 2 * (qx * qy - qz * qw);
        me[5] = 1 - 2 * (qx * qx + qz * qz);
        me[6] = 2 * (qy * qz + qx * qw);

        me[8] = 2 * (qx * qz + qy * qw);
        me[9] = 2 * (qy * qz - qx * qw);
        me[10] = 1 - 2 * (qx * qx + qy * qy);

        me[12] = finalPos.x;
        me[13] = finalPos.y;
        me[14] = finalPos.z;

        gl!.uniformMatrix4fv(uModel, false, me);

        gl!.bindVertexArray(vao);
        gl!.drawElements(gl!.TRIANGLES, count, gl!.UNSIGNED_SHORT, 0);
      }

      animId = requestAnimationFrame(renderLoop);
    }

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      for (const vao of vaosToCleanup) gl.deleteVertexArray(vao);
      for (const buf of buffersToCleanup) gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, [onContextUpdate]);

  // Handle pointer down: detect cubie hit or initiate background camera orbit.
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!springRef.current.isSettled) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const hit = pickCubie(x, y, width, height);

    canvas.setPointerCapture(e.pointerId);

    if (hit) {
      dragRef.current = {
        active: true,
        isLocked: false,
        startScreen: { x: e.clientX, y: e.clientY },
        hitPoint: hit.hitPoint,
        normal: hit.normal,
        clickedCubieIndex: hit.cubieIndex,
        rotationAxis: null,
        screenTangent: null,
        sliceIndices: [],
      };
      velocityTrackerRef.current.reset(0, performance.now());
    } else {
      orbitRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startYaw: cameraAngleRef.current.yaw,
        startPitch: cameraAngleRef.current.pitch,
      };
    }
  }, [pickCubie]);

  // Handle pointer move: update camera orbit or slice rotation.
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    // 1. Camera orbit mode.
    if (orbitRef.current.active) {
      const dx = e.clientX - orbitRef.current.startX;
      const dy = e.clientY - orbitRef.current.startY;
      cameraAngleRef.current.yaw = orbitRef.current.startYaw - dx * 0.007;
      cameraAngleRef.current.pitch = Math.max(-1.35, Math.min(1.35, orbitRef.current.startPitch + dy * 0.007));
      return;
    }

    // 2. Slice kinematics mode.
    const drag = dragRef.current;
    if (!drag.active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const deltaX = e.clientX - drag.startScreen.x;
    const deltaY = e.clientY - drag.startScreen.y;
    const dragDist = Math.hypot(deltaX, deltaY);

    if (!drag.isLocked && dragDist >= 8) {
      const yaw = cameraAngleRef.current.yaw;
      const pitch = cameraAngleRef.current.pitch;
      const eye = createVec3(
        6.2 * Math.cos(yaw) * Math.cos(pitch),
        6.2 * Math.sin(pitch),
        6.2 * Math.sin(yaw) * Math.cos(pitch),
      );
      const view = makeLookAtMatrix(eye, createVec3(0, 0, 0), createVec3(0, 1, 0));
      const proj = makePerspectiveMatrix((Math.PI / 4), width / height, 0.1, 100);
      const viewProj = multiplyMat4(proj, view);

      const kin = evaluateDragKinematics(
        drag.hitPoint,
        drag.normal,
        { x: deltaX, y: deltaY },
        viewProj,
        width,
        height,
        8,
      );

      if (kin.isLocked && kin.selectedAxis && kin.selectedScreenTangent) {
        const positions = cubiesRef.current.map((c) => c.currentPosition);
        const sliceIndices = identifySliceIndices(positions, drag.clickedCubieIndex, kin.selectedAxis);

        drag.isLocked = true;
        drag.rotationAxis = kin.selectedAxis;
        drag.screenTangent = kin.selectedScreenTangent;
        drag.sliceIndices = sliceIndices;
      }
    }

    if (drag.isLocked && drag.rotationAxis && drag.screenTangent) {
      const dragPixels = dotVec2({ x: deltaX, y: deltaY }, drag.screenTangent);
      const angle = dragPixels * 0.008;

      velocityTrackerRef.current.update(angle, performance.now());
      springRef.current = {
        position: angle,
        velocity: 0,
        target: angle,
        isSettled: true,
      };
    }
  }, []);

  // Handle pointer release: launch spring oscillation or exit orbit mode.
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (canvasRef.current && canvasRef.current.hasPointerCapture(e.pointerId)) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }

    if (orbitRef.current.active) {
      orbitRef.current.active = false;
      return;
    }

    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;

    if (!drag.isLocked || !drag.rotationAxis) {
      dragRef.current = {
        ...dragRef.current,
        active: false,
        isLocked: false,
        rotationAxis: null,
        screenTangent: null,
        sliceIndices: [],
      };
      return;
    }

    const currentAngle = springRef.current.position;
    const releaseVelocity = velocityTrackerRef.current.getVelocity();
    const snapTarget = computeSnapAngle(currentAngle, releaseVelocity, DEFAULT_SPRING_CONFIG);

    springRef.current = {
      position: currentAngle,
      velocity: releaseVelocity,
      target: snapTarget,
      isSettled: false,
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        cursor: "grab",
        touchAction: "none",
      }}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-label="3D Rubik's Cube interactive puzzle element"
    />
  );
}

export default RubiksCubeCanvas;
