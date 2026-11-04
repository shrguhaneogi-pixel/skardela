// ASD-STE100 Simplified Technical English comments.
// Mathematical engine for 3D Rubik's Cube vector projection, kinematics, and orientation snapping.

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Mat4 {
  elements: Float32Array;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export function createVec3(x = 0, y = 0, z = 0): Vec3 {
  return { x, y, z };
}

export function copyVec3(v: Vec3): Vec3 {
  return { x: v.x, y: v.y, z: v.z };
}

export function addVec3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function subVec3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scaleVec3(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function dotVec3(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function crossVec3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function lengthVec3(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function normalizeVec3(v: Vec3): Vec3 {
  const len = lengthVec3(v);
  if (len < 1e-6) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export function createVec2(x = 0, y = 0): Vec2 {
  return { x, y };
}

export function dotVec2(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

export function lengthVec2(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

export function normalizeVec2(v: Vec2): Vec2 {
  const len = lengthVec2(v);
  if (len < 1e-6) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

// Identity matrix in column-major order.
export function createIdentityMat4(): Mat4 {
  const elements = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
  return { elements };
}

// Multiply 4x4 matrices: out = a * b (column-major).
export function multiplyMat4(a: Mat4, b: Mat4): Mat4 {
  const ae = a.elements;
  const be = b.elements;
  const te = new Float32Array(16);

  const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
  const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
  const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
  const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

  for (let i = 0; i < 4; i++) {
    const b1 = be[i * 4];
    const b2 = be[i * 4 + 1];
    const b3 = be[i * 4 + 2];
    const b4 = be[i * 4 + 3];

    te[i * 4] = a11 * b1 + a12 * b2 + a13 * b3 + a14 * b4;
    te[i * 4 + 1] = a21 * b1 + a22 * b2 + a23 * b3 + a24 * b4;
    te[i * 4 + 2] = a31 * b1 + a32 * b2 + a33 * b3 + a34 * b4;
    te[i * 4 + 3] = a41 * b1 + a42 * b2 + a43 * b3 + a44 * b4;
  }

  return { elements: te };
}

// Transform 3D point by 4x4 matrix with perspective division.
export function projectPoint(p: Vec3, m: Mat4): Vec3 {
  const e = m.elements;
  const x = p.x, y = p.y, z = p.z;
  const w = 1.0 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

  return {
    x: (e[0] * x + e[4] * y + e[8] * z + e[12]) * w,
    y: (e[1] * x + e[5] * y + e[9] * z + e[13]) * w,
    z: (e[2] * x + e[6] * y + e[10] * z + e[14]) * w,
  };
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
    x: ((ndc.x + 1.0) * 0.5) * viewportWidth,
    y: ((1.0 - ndc.y) * 0.5) * viewportHeight,
  };
}

// Construct perspective projection matrix.
export function makePerspectiveMatrix(
  fovRadians: number,
  aspect: number,
  near: number,
  far: number,
): Mat4 {
  const te = new Float32Array(16);
  const f = 1.0 / Math.tan(fovRadians * 0.5);
  const nf = 1.0 / (near - far);

  te[0] = f / aspect;
  te[5] = f;
  te[10] = (far + near) * nf;
  te[11] = -1.0;
  te[14] = 2.0 * far * near * nf;

  return { elements: te };
}

// Construct lookAt view matrix.
export function makeLookAtMatrix(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const z = normalizeVec3(subVec3(eye, target));
  const x = normalizeVec3(crossVec3(up, z));
  const y = crossVec3(z, x);

  const te = new Float32Array(16);
  te[0] = x.x;
  te[4] = x.y;
  te[8] = x.z;
  te[12] = -dotVec3(x, eye);

  te[1] = y.x;
  te[5] = y.y;
  te[9] = y.z;
  te[13] = -dotVec3(y, eye);

  te[2] = z.x;
  te[6] = z.y;
  te[10] = z.z;
  te[14] = -dotVec3(z, eye);

  te[15] = 1.0;

  return { elements: te };
}

// Snap a raw normal vector to the nearest orthogonal unit cardinal vector.
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
    return [{ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }];
  }
  if (n.y !== 0) {
    return [{ x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 0 }];
  }
  return [{ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }];
}

export interface DragProjectionCandidate {
  tangent: Vec3;
  rotationAxis: Vec3;
  screenVector: Vec2;
  dot: number;
}

export interface DragKinematicsResult {
  isLocked: boolean;
  selectedAxis: Vec3 | null;
  selectedTangent: Vec3 | null;
  selectedScreenTangent: Vec2 | null;
  dragAmount: number;
  rotationSign: number;
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
  const dragDistance = lengthVec2(dragVector2D);
  if (dragDistance < thresholdPixels) {
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

  const dot1 = dotVec2(dragVector2D, sv1);
  const dot2 = dotVec2(dragVector2D, sv2);

  const useFirst = Math.abs(dot1) >= Math.abs(dot2);
  const chosenTangent = useFirst ? t1 : t2;
  const chosenScreenTangent = useFirst ? sv1 : sv2;
  const chosenDot = useFirst ? dot1 : dot2;
  const rotationSign = Math.sign(chosenDot) || 1;

  // Rotation axis = normal cross tangent (right-hand rule rotates in direction of tangent).
  const axis = crossVec3(normal, chosenTangent);

  return {
    isLocked: true,
    selectedAxis: axis,
    selectedTangent: chosenTangent,
    selectedScreenTangent: chosenScreenTangent,
    dragAmount: chosenDot,
    rotationSign,
  };
}

function subVec2(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

// Identify which 9 cubies belong to the rotating slice.
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
    const coord = Math.round(dotVec3(pos, axisNorm));
    if (coord === targetCoord) {
      sliceIndices.push(i);
    }
  }

  return sliceIndices;
}

// Create quaternion from unit axis and angle in radians.
export function quaternionFromAxisAngle(axis: Vec3, angle: number): Quaternion {
  const norm = normalizeVec3(axis);
  const halfAngle = angle * 0.5;
  const s = Math.sin(halfAngle);
  return {
    x: norm.x * s,
    y: norm.y * s,
    z: norm.z * s,
    w: Math.cos(halfAngle),
  };
}

// Multiply quaternions: out = a * b.
export function multiplyQuaternions(a: Quaternion, b: Quaternion): Quaternion {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}

// Rotate vector by quaternion.
export function rotateVec3ByQuaternion(v: Vec3, q: Quaternion): Vec3 {
  const u = { x: q.x, y: q.y, z: q.z };
  const s = q.w;

  const dotUV = dotVec3(u, v);
  const crossUV = crossVec3(u, v);
  const crossU_crossUV = crossVec3(u, crossUV);

  return {
    x: 2.0 * dotUV * u.x + (s * s - dotVec3(u, u)) * v.x + 2.0 * s * crossUV.x,
    y: 2.0 * dotUV * u.y + (s * s - dotVec3(u, u)) * v.y + 2.0 * s * crossUV.y,
    z: 2.0 * dotUV * u.z + (s * s - dotVec3(u, u)) * v.z + 2.0 * s * crossUV.z,
  };
}

// Round coordinates to nearest integers [-1, 0, 1] to prevent floating point drift.
export function cleanCubiePosition(v: Vec3): Vec3 {
  return {
    x: Math.round(v.x),
    y: Math.round(v.y),
    z: Math.round(v.z),
  };
}

// Snap a quaternion to the nearest 90-degree orthogonal orientation.
export function snapQuaternionToOrtho(q: Quaternion): Quaternion {
  const vx = rotateVec3ByQuaternion({ x: 1, y: 0, z: 0 }, q);
  const vy = rotateVec3ByQuaternion({ x: 0, y: 1, z: 0 }, q);

  const snappedVx = snapToCardinalNormal(vx);
  let snappedVy = snapToCardinalNormal(vy);

  // Keep vy orthogonal to vx.
  if (Math.abs(dotVec3(snappedVx, snappedVy)) > 0.5) {
    if (snappedVx.y !== 0) {
      snappedVy = { x: 1, y: 0, z: 0 };
    } else {
      snappedVy = { x: 0, y: 1, z: 0 };
    }
  }
  const snappedVz = crossVec3(snappedVx, snappedVy);

  return matrixToQuaternion(snappedVx, snappedVy, snappedVz);
}

// Convert 3x3 orthogonal basis vectors to quaternion.
export function matrixToQuaternion(x: Vec3, y: Vec3, z: Vec3): Quaternion {
  const m00 = x.x, m01 = y.x, m02 = z.x;
  const m10 = x.y, m11 = y.y, m12 = z.y;
  const m20 = x.z, m21 = y.z, m22 = z.z;

  const trace = m00 + m11 + m22;
  let qx = 0, qy = 0, qz = 0, qw = 1;

  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1.0);
    qw = 0.25 / s;
    qx = (m21 - m12) * s;
    qy = (m02 - m20) * s;
    qz = (m10 - m01) * s;
  } else if (m00 > m11 && m00 > m22) {
    const s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);
    qw = (m21 - m12) / s;
    qx = 0.25 * s;
    qy = (m01 + m10) / s;
    qz = (m02 + m20) / s;
  } else if (m11 > m22) {
    const s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);
    qw = (m02 - m20) / s;
    qx = (m01 + m10) / s;
    qy = 0.25 * s;
    qz = (m12 + m21) / s;
  } else {
    const s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);
    qw = (m10 - m01) / s;
    qx = (m02 + m20) / s;
    qy = (m12 + m21) / s;
    qz = 0.25 * s;
  }

  const len = Math.hypot(qx, qy, qz, qw);
  return { x: qx / len, y: qy / len, z: qz / len, w: qw / len };
}
