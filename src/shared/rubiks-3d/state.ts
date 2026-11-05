// ASD-STE100 Simplified Technical English comments.
// LLM state synchronization, cubie definitions, and 54-facelet cube representation.

import {
  cleanCubiePosition,
  createVec3,
  dotVec3,
  multiplyQuaternions,
  quaternionFromAxisAngle,
  rotateVec3ByQuaternion,
  snapQuaternionToOrtho,
  snapToCardinalNormal,
  type Quaternion,
  type Vec3,
} from "./math.ts";

export * from "./singmaster.ts";

export type FaceName = "U" | "D" | "F" | "B" | "L" | "R";

export interface FaceletColor {
  hex: string;
  name: string;
}

export const CUBE_PALETTE: Record<FaceName, FaceletColor> = {
  // Up (+Y)
  U: { hex: "#f8fafc", name: "White" },
  // Down (-Y)
  D: { hex: "#eab308", name: "Yellow" },
  // Front (+Z)
  F: { hex: "#10b981", name: "Green" },
  // Back (-Z)
  B: { hex: "#2563eb", name: "Blue" },
  // Left (-X)
  L: { hex: "#f97316", name: "Orange" },
  // Right (+X)
  R: { hex: "#e11d48", name: "Red" },
};

// Obsidian dark graphite core.
export const CORE_BODY_COLOR = "#111215";

export interface CubieData {
  index: number;
  initialPosition: Vec3;
  currentPosition: Vec3;
  quaternion: Quaternion;
}

export interface CubeLLMContext {
  // 54-character URFDLB string.
  facelets54: string;
  isSolved: boolean;
  moveCount: number;
  moveHistory: string[];
  lastMove: string | null;
  // 0.0 (solved) to 1.0 (scrambled).
  entropy: number;
  // Text snippet for AI prompt injection.
  llmPromptSnippet: string;
}

// Generate the 27 starting cubie definitions for a 3x3x3 cube.
export function generateInitialCubies(): CubieData[] {
  const cubies: CubieData[] = [];
  let index = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubies.push({
          index,
          initialPosition: createVec3(x, y, z),
          currentPosition: createVec3(x, y, z),
          quaternion: { x: 0, y: 0, z: 0, w: 1 },
        });
        index++;
      }
    }
  }
  return cubies;
}

// Initial face normals in cubie local space.
const LOCAL_FACE_NORMALS: Record<FaceName, Vec3> = {
  U: createVec3(0, 1, 0),
  D: createVec3(0, -1, 0),
  R: createVec3(1, 0, 0),
  L: createVec3(-1, 0, 0),
  F: createVec3(0, 0, 1),
  B: createVec3(0, 0, -1),
};

// Map world normal direction to corresponding FaceName.
export function normalToFaceName(norm: Vec3): FaceName {
  const n = snapToCardinalNormal(norm);
  if (n.y === 1) return "U";
  if (n.y === -1) return "D";
  if (n.x === 1) return "R";
  if (n.x === -1) return "L";
  if (n.z === 1) return "F";
  return "B";
}

// Compute 3D coordinate for a facelet row and col.
function getFaceletCoordinate(face: FaceName, row: number, col: number): Vec3 {
  if (face === "U") return createVec3(-1 + col, 1, -1 + row);
  if (face === "R") return createVec3(1, 1 - row, 1 - col);
  if (face === "F") return createVec3(-1 + col, 1 - row, 1);
  if (face === "D") return createVec3(-1 + col, -1, 1 - row);
  if (face === "L") return createVec3(-1, 1 - row, -1 + col);
  return createVec3(1 - col, 1 - row, -1);
}

// Find which local face of the cubie currently points in targetNormal direction.
function findStickerFace(cubie: CubieData, targetNormal: Vec3, defaultFace: FaceName): FaceName {
  const entries = Object.entries(LOCAL_FACE_NORMALS) as [FaceName, Vec3][];
  for (const [candidateFace, localNorm] of entries) {
    const worldNorm = rotateVec3ByQuaternion(localNorm, cubie.quaternion);
    const snapped = snapToCardinalNormal(worldNorm);
    if (dotVec3(snapped, targetNormal) > 0.9) {
      return candidateFace;
    }
  }
  return defaultFace;
}

// Extract standard 54-facelet string (URFDLB sequence) from cubie positions and quaternions.
export function extractFacelets54(cubies: CubieData[]): string {
  const grid = new Map<string, CubieData>();
  for (const c of cubies) {
    const p = cleanCubiePosition(c.currentPosition);
    grid.set(`${p.x},${p.y},${p.z}`, c);
  }

  const faceOrder: FaceName[] = ["U", "R", "F", "D", "L", "B"];
  let result = "";

  for (const face of faceOrder) {
    const targetNormal = LOCAL_FACE_NORMALS[face];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const coord = getFaceletCoordinate(face, row, col);
        const cubie = grid.get(`${coord.x},${coord.y},${coord.z}`);
        if (cubie) {
          result += findStickerFace(cubie, targetNormal, face);
        } else {
          result += face;
        }
      }
    }
  }

  return result;
}

// Calculate solve status and entropy from 54-facelet string.
export function evaluateCubeState(
  facelets54: string,
  moveHistory: string[] = [],
  lastMove: string | null = null,
): CubeLLMContext {
  const solvedTemplate = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";
  let mismatches = 0;
  for (let i = 0; i < 54; i++) {
    if (facelets54[i] !== solvedTemplate[i]) {
      mismatches++;
    }
  }

  const isSolved = mismatches === 0;
  // 48 non-center facelets.
  const entropy = Number((mismatches / 48.0).toFixed(3));
  const promptSnippet = `[RUBIKS_CUBE_STATE: moves=${moveHistory.length}, solved=${isSolved}, entropy=${entropy}, facelets=${facelets54}, last_move=${lastMove ?? "none"}]`;

  return {
    facelets54,
    isSolved,
    moveCount: moveHistory.length,
    moveHistory,
    lastMove,
    entropy,
    llmPromptSnippet: promptSnippet,
  };
}

// Apply an instantaneous orthogonal move to an array of cubie definitions.
export function applyMoveToCubies(
  cubies: CubieData[],
  axis: Vec3,
  layerCoord: number,
  angleRadians: number,
): CubieData[] {
  const normAxis = snapToCardinalNormal(axis);
  const qRotate = quaternionFromAxisAngle(normAxis, angleRadians);

  return cubies.map((c) => {
    const pos = c.currentPosition;
    const coord = Math.round(dotVec3(pos, normAxis));
    if (coord !== layerCoord) {
      return c;
    }

    const rotatedPos = rotateVec3ByQuaternion(pos, qRotate);
    const cleanedPos = cleanCubiePosition(rotatedPos);
    const newQuat = multiplyQuaternions(qRotate, c.quaternion);
    const snappedQuat = snapQuaternionToOrtho(newQuat);

    return {
      ...c,
      currentPosition: cleanedPos,
      quaternion: snappedQuat,
    };
  });
}
