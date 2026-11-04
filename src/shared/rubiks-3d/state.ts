// ASD-STE100 Simplified Technical English comments.
// LLM state synchronization, Singmaster move notation, and 54-facelet cube representation.

import {
  cleanCubiePosition,
  copyVec3,
  createVec3,
  dotVec3,
  matrixToQuaternion,
  multiplyQuaternions,
  quaternionFromAxisAngle,
  rotateVec3ByQuaternion,
  snapQuaternionToOrtho,
  snapToCardinalNormal,
  type Quaternion,
  type Vec3,
} from "./math.ts";

export type FaceName = "U" | "D" | "F" | "B" | "L" | "R";

export interface FaceletColor {
  hex: string;
  name: string;
}

export const CUBE_PALETTE: Record<FaceName, FaceletColor> = {
  U: { hex: "#f8fafc", name: "White" }, // Up (+Y)
  D: { hex: "#eab308", name: "Yellow" }, // Down (-Y)
  F: { hex: "#10b981", name: "Green" }, // Front (+Z)
  B: { hex: "#2563eb", name: "Blue" }, // Back (-Z)
  L: { hex: "#f97316", name: "Orange" }, // Left (-X)
  R: { hex: "#e11d48", name: "Red" }, // Right (+X)
};

export const CORE_BODY_COLOR = "#111215"; // Obsidian dark graphite core

export interface CubieData {
  index: number;
  initialPosition: Vec3;
  currentPosition: Vec3;
  quaternion: Quaternion;
}

export interface CubeLLMContext {
  facelets54: string; // 54-character URFDLB string
  isSolved: boolean;
  moveCount: number;
  moveHistory: string[];
  lastMove: string | null;
  entropy: number; // 0.0 (solved) to 1.0 (scrambled)
  llmPromptSnippet: string; // Ready for agent prompt injection
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

// Extract standard 54-facelet string (URFDLB sequence) from cubie positions and quaternions.
export function extractFacelets54(cubies: CubieData[]): string {
  // Build 3D spatial lookup: map "x,y,z" to cubie index.
  const grid = new Map<string, CubieData>();
  for (const c of cubies) {
    const p = cleanCubiePosition(c.currentPosition);
    grid.set(`${p.x},${p.y},${p.z}`, c);
  }

  // Standard facelet order definition for each face:
  // U: y=1, rows z=-1 to 1, cols x=-1 to 1
  // R: x=1, rows y=1 to -1, cols z=1 to -1
  // F: z=1, rows y=1 to -1, cols x=-1 to 1
  // D: y=-1, rows z=1 to -1, cols x=-1 to 1
  // L: x=-1, rows y=1 to -1, cols z=-1 to 1
  // B: z=-1, rows y=1 to -1, cols x=1 to -1
  const faceOrder: FaceName[] = ["U", "R", "F", "D", "L", "B"];
  let result = "";

  for (const face of faceOrder) {
    const targetNormal = LOCAL_FACE_NORMALS[face];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        let x = 0, y = 0, z = 0;
        if (face === "U") {
          y = 1;
          z = -1 + row;
          x = -1 + col;
        } else if (face === "R") {
          x = 1;
          y = 1 - row;
          z = 1 - col;
        } else if (face === "F") {
          z = 1;
          y = 1 - row;
          x = -1 + col;
        } else if (face === "D") {
          y = -1;
          z = 1 - row;
          x = -1 + col;
        } else if (face === "L") {
          x = -1;
          y = 1 - row;
          z = -1 + col;
        } else if (face === "B") {
          z = -1;
          y = 1 - row;
          x = 1 - col;
        }

        const cubie = grid.get(`${x},${y},${z}`);
        if (!cubie) {
          result += face;
          continue;
        }

        // Find which local face of the cubie currently points in targetNormal direction.
        let stickerFace: FaceName = face;
        for (const [candidateFace, localNorm] of Object.entries(LOCAL_FACE_NORMALS) as [FaceName, Vec3][]) {
          const worldNorm = rotateVec3ByQuaternion(localNorm, cubie.quaternion);
          const snapped = snapToCardinalNormal(worldNorm);
          if (dotVec3(snapped, targetNormal) > 0.9) {
            stickerFace = candidateFace;
            break;
          }
        }
        result += stickerFace;
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
  const entropy = Number((mismatches / 48.0).toFixed(3)); // 48 non-center facelets

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

// Convert slice rotation parameters into standard Singmaster notation.
export function getSingmasterMove(
  axis: Vec3,
  layerCoord: number,
  angleRadians: number,
): string {
  let a = snapToCardinalNormal(axis);
  let layer = Math.round(layerCoord);
  let angle = angleRadians;

  // Canonicalize negative axis vectors to positive axis vectors.
  if (a.x < 0 || a.y < 0 || a.z < 0) {
    a = { x: -a.x, y: -a.y, z: -a.z };
    layer = -layer;
    angle = -angle;
  }

  const turns = Math.round(angle / (Math.PI * 0.5));
  const modTurns = ((turns % 4) + 4) % 4;

  if (modTurns === 0) return "";

  let baseLetter = "";
  let isClockwise = true;

  if (a.y === 1) {
    // Y-axis rotation
    if (layer === 1) {
      baseLetter = "U";
      isClockwise = modTurns === 3;
    } else if (layer === -1) {
      baseLetter = "D";
      isClockwise = modTurns === 1;
    } else {
      baseLetter = "E";
      isClockwise = modTurns === 1;
    }
  } else if (a.x === 1) {
    // X-axis rotation
    if (layer === 1) {
      baseLetter = "R";
      isClockwise = modTurns === 3;
    } else if (layer === -1) {
      baseLetter = "L";
      isClockwise = modTurns === 1;
    } else {
      baseLetter = "M";
      isClockwise = modTurns === 1;
    }
  } else {
    // Z-axis rotation
    if (layer === 1) {
      baseLetter = "F";
      isClockwise = modTurns === 3;
    } else if (layer === -1) {
      baseLetter = "B";
      isClockwise = modTurns === 1;
    } else {
      baseLetter = "S";
      isClockwise = modTurns === 3;
    }
  }

  if (modTurns === 2) {
    return `${baseLetter}2`;
  }
  return isClockwise ? baseLetter : `${baseLetter}'`;
}

// Parse Singmaster notation move (e.g. "R", "U'", "F2") into rotation axis, layer, and angle.
export function parseSingmasterMove(moveStr: string): {
  axis: Vec3;
  layer: number;
  angle: number;
} | null {
  const trimmed = moveStr.trim();
  if (!trimmed) return null;

  const letter = trimmed[0]?.toUpperCase();
  if (!letter) return null;
  const modifier = trimmed.slice(1);

  let multiplier = 1;
  if (modifier === "'") multiplier = -1;
  else if (modifier === "2") multiplier = 2;

  const halfPi = Math.PI * 0.5;

  switch (letter) {
    case "U":
      return { axis: createVec3(0, 1, 0), layer: 1, angle: -halfPi * multiplier };
    case "D":
      return { axis: createVec3(0, 1, 0), layer: -1, angle: halfPi * multiplier };
    case "R":
      return { axis: createVec3(1, 0, 0), layer: 1, angle: -halfPi * multiplier };
    case "L":
      return { axis: createVec3(1, 0, 0), layer: -1, angle: halfPi * multiplier };
    case "F":
      return { axis: createVec3(0, 0, 1), layer: 1, angle: -halfPi * multiplier };
    case "B":
      return { axis: createVec3(0, 0, 1), layer: -1, angle: halfPi * multiplier };
    case "M":
      return { axis: createVec3(1, 0, 0), layer: 0, angle: halfPi * multiplier };
    case "E":
      return { axis: createVec3(0, 1, 0), layer: 0, angle: halfPi * multiplier };
    case "S":
      return { axis: createVec3(0, 0, 1), layer: 0, angle: -halfPi * multiplier };
    default:
      return null;
  }
}

// Generate a random valid scramble sequence of specified length.
export function generateRandomScramble(moveCount = 20): string[] {
  const baseMoves = ["U", "D", "R", "L", "F", "B"];
  const modifiers = ["", "'", "2"];
  const moves: string[] = [];

  let lastMove = "";
  for (let i = 0; i < moveCount; i++) {
    let candidate = "";
    do {
      candidate = baseMoves[Math.floor(Math.random() * baseMoves.length)];
    } while (candidate === lastMove);

    lastMove = candidate;
    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push(`${candidate}${mod}`);
  }

  return moves;
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
