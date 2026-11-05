// ASD-STE100 Simplified Technical English comments.
// Singmaster move notation parser, serializer, and random scramble generator.

import { createVec3, snapToCardinalNormal, type Vec3 } from "./math.ts";

// Return the base letter for a slice rotation.
function getAxisMoveLetter(axisName: "X" | "Y" | "Z", layer: number): string {
  if (axisName === "Y") {
    if (layer === 1) return "U";
    if (layer === -1) return "D";
    return "E";
  }
  if (axisName === "X") {
    if (layer === 1) return "R";
    if (layer === -1) return "L";
    return "M";
  }
  if (layer === 1) return "F";
  if (layer === -1) return "B";
  return "S";
}

// Determine if a rotation direction is clockwise.
function isClockwiseTurn(axisName: "X" | "Y" | "Z", layer: number, modTurns: number): boolean {
  if (axisName === "Y") {
    return layer === 1 ? modTurns === 3 : modTurns === 1;
  }
  if (axisName === "X") {
    return layer === 1 ? modTurns === 3 : modTurns === 1;
  }
  return layer === 1 || layer === 0 ? modTurns === 3 : modTurns === 1;
}

// Convert slice rotation parameters into standard Singmaster notation.
export function getSingmasterMove(axis: Vec3, layerCoord: number, angleRadians: number): string {
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

  const axisName: "X" | "Y" | "Z" = a.y === 1 ? "Y" : a.x === 1 ? "X" : "Z";
  const baseLetter = getAxisMoveLetter(axisName, layer);
  const isClockwise = isClockwiseTurn(axisName, layer, modTurns);

  if (modTurns === 2) {
    return `${baseLetter}2`;
  }
  return isClockwise ? baseLetter : `${baseLetter}'`;
}

// Parse a Singmaster move code into axis, layer, and rotation angle.
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
      const idx = Math.floor(Math.random() * baseMoves.length);
      candidate = baseMoves[idx] ?? "U";
    } while (candidate === lastMove);

    lastMove = candidate;
    const modIdx = Math.floor(Math.random() * modifiers.length);
    const mod = modifiers[modIdx] ?? "";
    moves.push(`${candidate}${mod}`);
  }

  return moves;
}
