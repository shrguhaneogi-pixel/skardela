// ASD-STE100 Simplified Technical English comments.
// Quaternion mathematical definitions and 3D orientation snapping.

import { crossVec3, dotVec3, normalizeVec3, type Vec3 } from "./vec.ts";

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
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

  return {
    x: 2.0 * dotUV * u.x + (s * s - dotVec3(u, u)) * v.x + 2.0 * s * crossUV.x,
    y: 2.0 * dotUV * u.y + (s * s - dotVec3(u, u)) * v.y + 2.0 * s * crossUV.y,
    z: 2.0 * dotUV * u.z + (s * s - dotVec3(u, u)) * v.z + 2.0 * s * crossUV.z,
  };
}

// Round coordinates to nearest integers to prevent floating-point drift.
export function cleanCubiePosition(v: Vec3): Vec3 {
  return {
    x: Math.round(v.x),
    y: Math.round(v.y),
    z: Math.round(v.z),
  };
}

// Helper to calculate quaternion components when trace is zero or negative.
function quatFromAxesNonPositiveTrace(
  m00: number,
  m11: number,
  m22: number,
  m12: number,
  m21: number,
  m02: number,
  m20: number,
  m01: number,
  m10: number,
): Quaternion {
  if (m00 > m11 && m00 > m22) {
    const s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);
    return { x: 0.25 * s, y: (m01 + m10) / s, z: (m02 + m20) / s, w: (m21 - m12) / s };
  }
  if (m11 > m22) {
    const s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);
    return { x: (m01 + m10) / s, y: 0.25 * s, z: (m12 + m21) / s, w: (m02 - m20) / s };
  }
  const s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);
  return { x: (m02 + m20) / s, y: (m12 + m21) / s, z: 0.25 * s, w: (m10 - m01) / s };
}

// Convert 3x3 orthogonal basis vectors to quaternion.
export function matrixToQuaternion(x: Vec3, y: Vec3, z: Vec3): Quaternion {
  const m00 = x.x;
  const m01 = y.x;
  const m02 = z.x;
  const m10 = x.y;
  const m11 = y.y;
  const m12 = z.y;
  const m20 = x.z;
  const m21 = y.z;
  const m22 = z.z;

  const trace = m00 + m11 + m22;
  let q: Quaternion;

  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1.0);
    q = {
      x: (m21 - m12) * s,
      y: (m02 - m20) * s,
      z: (m10 - m01) * s,
      w: 0.25 / s,
    };
  } else {
    q = quatFromAxesNonPositiveTrace(m00, m11, m22, m12, m21, m02, m20, m01, m10);
  }

  const len = Math.hypot(q.x, q.y, q.z, q.w);
  return { x: q.x / len, y: q.y / len, z: q.z / len, w: q.w / len };
}

// Snap a quaternion to the nearest 90-degree orthogonal orientation.
export function snapQuaternionToOrtho(q: Quaternion): Quaternion {
  const vx = rotateVec3ByQuaternion({ x: 1, y: 0, z: 0 }, q);
  const vy = rotateVec3ByQuaternion({ x: 0, y: 1, z: 0 }, q);

  const snappedVx = {
    x:
      Math.abs(vx.x) >= Math.abs(vx.y) && Math.abs(vx.x) >= Math.abs(vx.z)
        ? Math.sign(vx.x) || 1
        : 0,
    y:
      Math.abs(vx.y) > Math.abs(vx.x) && Math.abs(vx.y) >= Math.abs(vx.z)
        ? Math.sign(vx.y) || 1
        : 0,
    z:
      Math.abs(vx.z) > Math.abs(vx.x) && Math.abs(vx.z) > Math.abs(vx.y) ? Math.sign(vx.z) || 1 : 0,
  };

  let snappedVy = {
    x:
      Math.abs(vy.x) >= Math.abs(vy.y) && Math.abs(vy.x) >= Math.abs(vy.z)
        ? Math.sign(vy.x) || 1
        : 0,
    y:
      Math.abs(vy.y) > Math.abs(vy.x) && Math.abs(vy.y) >= Math.abs(vy.z)
        ? Math.sign(vy.y) || 1
        : 0,
    z:
      Math.abs(vy.z) > Math.abs(vy.x) && Math.abs(vy.z) > Math.abs(vy.y) ? Math.sign(vy.z) || 1 : 0,
  };

  // Keep vy orthogonal to vx.
  if (Math.abs(dotVec3(snappedVx, snappedVy)) > 0.5) {
    snappedVy = snappedVx.y === 0 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
  }
  const snappedVz = crossVec3(snappedVx, snappedVy);

  return matrixToQuaternion(snappedVx, snappedVy, snappedVz);
}
