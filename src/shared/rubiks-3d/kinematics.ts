// ASD-STE100 Simplified Technical English comments.
// Kinematics and 2D-to-3D screen tangent projection for Rubik's Cube slices.

import { type Mat4, projectPoint } from "./matrix.ts";
import {
  addVec3,
  crossVec3,
  dotVec2,
  dotVec3,
  lengthVec2,
  normalizeVec2,
  normalizeVec3,
  type Vec2,
  type Vec3,
} from "./vec.ts";

export interface DragKinematicsResult {
  isLocked: boolean;
  selectedAxis: Vec3 | null;
  selectedTangent: Vec3 | null;
  selectedScreenTangent: Vec2 | null;
  dragAmount: number;
  rotationSign: number;
}

function subVec2(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

// Convert 3D world coordinate to 2D screen coordinate.
export function worldToScreen(
  point: Vec3,
  viewProjectionMatrix: Mat4,
  viewportWidth: number,
  viewportHeight: number,
): Vec2 {
  const ndc = projectPoint(point, viewProjectionMatrix);
  return {
    x: (ndc.x * 0.5 + 0.5) * viewportWidth,
    y: (-ndc.y * 0.5 + 0.5) * viewportHeight,
  };
}

// Snap arbitrary face normal to the closest cardinal unit vector.
export function snapToCardinalNormal(v: Vec3): Vec3 {
  const ax = Math.abs(v.x);
  const ay = Math.abs(v.y);
  const az = Math.abs(v.z);

  if (ax >= ay && ax >= az) {
    return { x: Math.sign(v.x) || 1, y: 0, z: 0 };
  }
  if (ay >= ax && ay >= az) {
    return { x: 0, y: Math.sign(v.y) || 1, z: 0 };
  }
  return { x: 0, y: 0, z: Math.sign(v.z) || 1 };
}

// Find the two orthogonal tangent vectors for a face normal.
export function getFaceTangents(normal: Vec3): [Vec3, Vec3] {
  const n = snapToCardinalNormal(normal);
  if (n.x !== 0) {
    return [
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 },
    ];
  }
  if (n.y !== 0) {
    return [
      { x: 0, y: 0, z: 1 },
      { x: 1, y: 0, z: 0 },
    ];
  }
  return [
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
  ];
}

// Select tangent vector with strongest alignment to drag direction.
function selectBestTangent(dragVector2D: Vec2, t1: Vec3, t2: Vec3, sv1: Vec2, sv2: Vec2) {
  const dot1 = dotVec2(dragVector2D, sv1);
  const dot2 = dotVec2(dragVector2D, sv2);
  const useFirst = Math.abs(dot1) >= Math.abs(dot2);

  return {
    chosenTangent: useFirst ? t1 : t2,
    chosenScreenTangent: useFirst ? sv1 : sv2,
    chosenDot: useFirst ? dot1 : dot2,
    rotationSign: Math.sign(useFirst ? dot1 : dot2) || 1,
  };
}

// Calculate 2D drag projection against 3D tangent vectors.
export function evaluateDragKinematics(
  hitPoint: Vec3,
  faceNormal: Vec3,
  dragVector2D: Vec2,
  viewProjMatrix: Mat4,
  viewWidth: number,
  viewHeight: number,
  thresholdPixels = 8,
): DragKinematicsResult {
  if (lengthVec2(dragVector2D) < thresholdPixels) {
    return {
      isLocked: false,
      selectedAxis: null,
      selectedTangent: null,
      selectedScreenTangent: null,
      dragAmount: 0,
      rotationSign: 0,
    };
  }

  const normal = snapToCardinalNormal(faceNormal);
  const [t1, t2] = getFaceTangents(normal);

  const screenBase = worldToScreen(hitPoint, viewProjMatrix, viewWidth, viewHeight);
  const screenP1 = worldToScreen(addVec3(hitPoint, t1), viewProjMatrix, viewWidth, viewHeight);
  const screenP2 = worldToScreen(addVec3(hitPoint, t2), viewProjMatrix, viewWidth, viewHeight);

  const sv1 = normalizeVec2(subVec2(screenP1, screenBase));
  const sv2 = normalizeVec2(subVec2(screenP2, screenBase));

  const best = selectBestTangent(dragVector2D, t1, t2, sv1, sv2);
  const axis = crossVec3(normal, best.chosenTangent);

  return {
    isLocked: true,
    selectedAxis: axis,
    selectedTangent: best.chosenTangent,
    selectedScreenTangent: best.chosenScreenTangent,
    dragAmount: best.chosenDot,
    rotationSign: best.rotationSign,
  };
}

// Identify which cubies belong to the rotating slice.
export function identifySliceIndices(
  cubiePositions: Vec3[],
  clickedCubieIndex: number,
  rotationAxis: Vec3,
): number[] {
  const axisNorm = normalizeVec3(rotationAxis);
  const clickedPos = cubiePositions[clickedCubieIndex];
  if (!clickedPos) return [];

  const targetCoord = Math.round(dotVec3(clickedPos, axisNorm));
  const sliceIndices: number[] = [];

  for (let i = 0; i < cubiePositions.length; i++) {
    const pos = cubiePositions[i];
    if (pos && Math.round(dotVec3(pos, axisNorm)) === targetCoord) {
      sliceIndices.push(i);
    }
  }

  return sliceIndices;
}
