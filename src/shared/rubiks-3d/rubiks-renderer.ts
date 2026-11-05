// ASD-STE100 Simplified Technical English comments.
// WebGL2 scene buffer allocation and cubie slice rendering pipeline.

import { buildCubieGeometry } from "./cubie-geometry.ts";
import { computeModelMatrix } from "./gl-shaders.ts";
import {
  cleanCubiePosition,
  createVec3,
  dotVec3,
  evaluateDragKinematics,
  identifySliceIndices,
  makeLookAtMatrix,
  makePerspectiveMatrix,
  multiplyMat4,
  multiplyQuaternions,
  quaternionFromAxisAngle,
  rotateVec3ByQuaternion,
  snapQuaternionToOrtho,
  type Vec2,
  type Vec3,
} from "./math.ts";
import { computeCameraEye } from "./rubiks-raycast.ts";
import {
  type CubeLLMContext,
  type CubieData,
  evaluateCubeState,
  extractFacelets54,
  getSingmasterMove,
} from "./state.ts";

export interface DragState {
  active: boolean;
  isLocked: boolean;
  startScreen: Vec2;
  hitPoint: Vec3;
  normal: Vec3;
  clickedCubieIndex: number;
  rotationAxis: Vec3 | null;
  screenTangent: Vec2 | null;
  sliceIndices: number[];
}

export function createEmptyDrag(): DragState {
  return {
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

export function settleSliceAnimation(
  cubies: CubieData[],
  drag: DragState,
  snapAngle: number,
  moveHistory: string[],
  onContextUpdate?: (context: CubeLLMContext) => void,
) {
  if (!drag.rotationAxis || drag.sliceIndices.length === 0) return;
  const qSnap = quaternionFromAxisAngle(drag.rotationAxis, snapAngle);

  for (const idx of drag.sliceIndices) {
    const c = cubies[idx];
    if (!c) continue;
    const rotatedPos = rotateVec3ByQuaternion(c.currentPosition, qSnap);
    c.currentPosition = cleanCubiePosition(rotatedPos);
    const newQuat = multiplyQuaternions(qSnap, c.quaternion);
    c.quaternion = snapQuaternionToOrtho(newQuat);
  }

  const clickedCubie = cubies[drag.clickedCubieIndex];
  if (clickedCubie && Math.abs(snapAngle) >= Math.PI * 0.2) {
    const layer = Math.round(dotVec3(clickedCubie.currentPosition, drag.rotationAxis));
    const moveName = getSingmasterMove(drag.rotationAxis, layer, snapAngle);
    if (moveName) {
      moveHistory.push(moveName);
    }
    const facelets = extractFacelets54(cubies);
    const evalContext = evaluateCubeState(facelets, moveHistory, moveName || null);
    if (onContextUpdate) {
      onContextUpdate(evalContext);
    }
  }
}

export function renderCubies(
  gl: WebGL2RenderingContext,
  cubies: CubieData[],
  vaos: WebGLVertexArrayObject[],
  indexCounts: number[],
  uModel: WebGLUniformLocation | null,
  drag: DragState,
  springPosition: number,
) {
  const isSliceRotating = Boolean(drag.rotationAxis && drag.sliceIndices.length > 0);
  const activeAngle = isSliceRotating ? springPosition : 0;
  const activeSliceQuat =
    isSliceRotating && drag.rotationAxis
      ? quaternionFromAxisAngle(drag.rotationAxis, activeAngle)
      : { x: 0, y: 0, z: 0, w: 1 };

  for (let i = 0; i < cubies.length; i++) {
    const c = cubies[i];
    const vao = vaos[i];
    const count = indexCounts[i];
    if (!c || !vao || count === undefined) continue;

    let finalPos = c.currentPosition;
    let finalQuat = c.quaternion;
    if (isSliceRotating && drag.sliceIndices.includes(i)) {
      finalPos = rotateVec3ByQuaternion(c.currentPosition, activeSliceQuat);
      finalQuat = multiplyQuaternions(activeSliceQuat, c.quaternion);
    }

    const modelElements = computeModelMatrix(finalPos, finalQuat);
    gl.uniformMatrix4fv(uModel, false, modelElements);
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
  }
}

export function setupCubieBuffers(gl: WebGL2RenderingContext, cubies: CubieData[]) {
  const buffersToCleanup: WebGLBuffer[] = [];
  const vaosToCleanup: WebGLVertexArrayObject[] = [];
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

  return { buffersToCleanup, vaosToCleanup, vaos, indexCounts };
}

export function updateKinematicsDrag(
  drag: DragState,
  deltaX: number,
  deltaY: number,
  yaw: number,
  pitch: number,
  width: number,
  height: number,
  cubies: CubieData[],
) {
  const eye = computeCameraEye(yaw, pitch);
  const view = makeLookAtMatrix(eye, createVec3(0, 0, 0), createVec3(0, 1, 0));
  const proj = makePerspectiveMatrix(Math.PI / 4, width / height, 0.1, 100);
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
    const positions = cubies.map((c) => c.currentPosition);
    drag.isLocked = true;
    drag.rotationAxis = kin.selectedAxis;
    drag.screenTangent = kin.selectedScreenTangent;
    drag.sliceIndices = identifySliceIndices(positions, drag.clickedCubieIndex, kin.selectedAxis);
  }
}
