// ASD-STE100 Simplified Technical English comments.
// 4x4 matrix mathematical definitions and projection transforms.

import { crossVec3, dotVec3, normalizeVec3, subVec3, type Vec3 } from "./vec.ts";

export interface Mat4 {
  elements: Float32Array;
}

// Identity matrix in column-major order.
export function createIdentityMat4(): Mat4 {
  return {
    elements: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
  };
}

// Multiply 4x4 matrices: out = a * b (column-major).
export function multiplyMat4(a: Mat4, b: Mat4): Mat4 {
  const ae = a.elements;
  const be = b.elements;
  const te = new Float32Array(16);

  const a11 = ae[0] ?? 0;
  const a12 = ae[4] ?? 0;
  const a13 = ae[8] ?? 0;
  const a14 = ae[12] ?? 0;
  const a21 = ae[1] ?? 0;
  const a22 = ae[5] ?? 0;
  const a23 = ae[9] ?? 0;
  const a24 = ae[13] ?? 0;
  const a31 = ae[2] ?? 0;
  const a32 = ae[6] ?? 0;
  const a33 = ae[10] ?? 0;
  const a34 = ae[14] ?? 0;
  const a41 = ae[3] ?? 0;
  const a42 = ae[7] ?? 0;
  const a43 = ae[11] ?? 0;
  const a44 = ae[15] ?? 0;

  for (let i = 0; i < 4; i++) {
    const b1 = be[i * 4] ?? 0;
    const b2 = be[i * 4 + 1] ?? 0;
    const b3 = be[i * 4 + 2] ?? 0;
    const b4 = be[i * 4 + 3] ?? 0;

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
  const x = p.x;
  const y = p.y;
  const z = p.z;
  const e3 = e[3] ?? 0;
  const e7 = e[7] ?? 0;
  const e11 = e[11] ?? 0;
  const e15 = e[15] ?? 0;
  const w = 1.0 / (e3 * x + e7 * y + e11 * z + e15);

  const e0 = e[0] ?? 0;
  const e4 = e[4] ?? 0;
  const e8 = e[8] ?? 0;
  const e12 = e[12] ?? 0;
  const e1 = e[1] ?? 0;
  const e5 = e[5] ?? 0;
  const e9 = e[9] ?? 0;
  const e13 = e[13] ?? 0;
  const e2 = e[2] ?? 0;
  const e6 = e[6] ?? 0;
  const e10 = e[10] ?? 0;
  const e14 = e[14] ?? 0;

  return {
    x: (e0 * x + e4 * y + e8 * z + e12) * w,
    y: (e1 * x + e5 * y + e9 * z + e13) * w,
    z: (e2 * x + e6 * y + e10 * z + e14) * w,
  };
}

// Perspective projection matrix (column-major).
export function makePerspectiveMatrix(
  fovY: number,
  aspect: number,
  near: number,
  far: number,
): Mat4 {
  const top = near * Math.tan(fovY * 0.5);
  const right = top * aspect;
  const elements = new Float32Array(16);

  elements[0] = near / right;
  elements[5] = near / top;
  elements[10] = -(far + near) / (far - near);
  elements[11] = -1.0;
  elements[14] = -(2.0 * far * near) / (far - near);

  return { elements };
}

// Look-at view matrix (column-major).
export function makeLookAtMatrix(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const zAxis = normalizeVec3(subVec3(eye, target));
  const xAxis = normalizeVec3(crossVec3(up, zAxis));
  const yAxis = crossVec3(zAxis, xAxis);

  const elements = new Float32Array(16);
  elements[0] = xAxis.x;
  elements[1] = yAxis.x;
  elements[2] = zAxis.x;

  elements[4] = xAxis.y;
  elements[5] = yAxis.y;
  elements[6] = zAxis.y;

  elements[8] = xAxis.z;
  elements[9] = yAxis.z;
  elements[10] = zAxis.z;

  elements[12] = -dotVec3(xAxis, eye);
  elements[13] = -dotVec3(yAxis, eye);
  elements[14] = -dotVec3(zAxis, eye);
  elements[15] = 1.0;

  return { elements };
}
