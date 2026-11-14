import type { PuzzleType } from "../../puzzle-types/registry";
import { cubeFaces } from "./cube-faces";

export const INITIAL_ROT_X = -14;
export const INITIAL_ROT_Y = -22;

// Finds the shortest angular distance from current to target angle.
export function normalizeTargetAngle(current: number, target: number): number {
  const diff = ((((target - current) % 360) + 540) % 360) - 180;
  return current + diff;
}

// Computes the face that currently points towards the camera.
// Uses transformed normal depth for each of the 6 canonical cube faces.
export function getNearestFace(rotXDeg: number, rotYDeg: number): PuzzleType {
  const radX = (rotXDeg * Math.PI) / 180;
  const radY = (rotYDeg * Math.PI) / 180;
  const cosX = Math.cos(radX);
  const sinX = Math.sin(radX);
  const cosY = Math.cos(radY);
  const sinY = Math.sin(radY);

  const scores: Record<PuzzleType, number> = {
    latics: cosY * cosX,
    "colour-binary": -sinY * cosX,
    guzzle: -cosY * cosX,
    tilt: sinY * cosX,
    orbital: -sinX,
    numpuz: sinX,
  };

  let bestType: PuzzleType = "latics";
  let maxScore = -Infinity;
  for (const face of cubeFaces) {
    const score = scores[face.type];
    if (score > maxScore) {
      maxScore = score;
      bestType = face.type;
    }
  }
  return bestType;
}
