// ASD-STE100 Simplified Technical English comments.
// Cubie mesh geometry generation with colored facelet stickers.

import type { Vec3 } from "./math.ts";
import { CUBE_PALETTE, type FaceName } from "./state.ts";

export interface CubieGeometry {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint16Array;
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

function getFaceCorners(norm: [number, number, number], half: number): [number, number, number][] {
  const [nx, ny, nz] = norm;
  if (nx === 1) {
    return [
      [half, -half, half],
      [half, -half, -half],
      [half, half, -half],
      [half, half, half],
    ];
  }
  if (nx === -1) {
    return [
      [-half, -half, -half],
      [-half, -half, half],
      [-half, half, half],
      [-half, half, -half],
    ];
  }
  if (ny === 1) {
    return [
      [-half, half, half],
      [half, half, half],
      [half, half, -half],
      [-half, half, -half],
    ];
  }
  if (ny === -1) {
    return [
      [-half, -half, -half],
      [half, -half, -half],
      [half, -half, half],
      [-half, -half, half],
    ];
  }
  if (nz === 1) {
    return [
      [-half, -half, half],
      [half, -half, half],
      [half, half, half],
      [-half, half, half],
    ];
  }
  return [
    [half, -half, -half],
    [-half, -half, -half],
    [-half, half, -half],
    [half, half, -half],
  ];
}

interface FaceDefinition {
  norm: [number, number, number];
  faceName: FaceName;
  condition: boolean;
}

function getFaceDefinitions(initPos: Vec3): FaceDefinition[] {
  return [
    { norm: [0, 1, 0], faceName: "U", condition: initPos.y === 1 },
    { norm: [0, -1, 0], faceName: "D", condition: initPos.y === -1 },
    { norm: [1, 0, 0], faceName: "R", condition: initPos.x === 1 },
    { norm: [-1, 0, 0], faceName: "L", condition: initPos.x === -1 },
    { norm: [0, 0, 1], faceName: "F", condition: initPos.z === 1 },
    { norm: [0, 0, -1], faceName: "B", condition: initPos.z === -1 },
  ];
}

// Build geometry for a single unit cubie with 6 colored facelet stickers.
export function buildCubieGeometry(initPos: Vec3): CubieGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const coreRgb: [number, number, number] = [0.08, 0.09, 0.11];
  const half = 0.47;
  const faces = getFaceDefinitions(initPos);

  let vertCount = 0;
  for (const f of faces) {
    const color = f.condition ? hexToRgb(CUBE_PALETTE[f.faceName].hex) : coreRgb;
    const corners = getFaceCorners(f.norm, half);

    for (const c of corners) {
      positions.push(...c);
      normals.push(...f.norm);
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
