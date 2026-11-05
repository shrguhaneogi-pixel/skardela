// ASD-STE100 Simplified Technical English comments.
// Unit tests for Rubik's Cube state extraction, LLM prompt generation, and Singmaster moves.

import { describe, expect, it } from "vitest";
import { createVec3 } from "./math.ts";
import {
  applyMoveToCubies,
  evaluateCubeState,
  extractFacelets54,
  generateInitialCubies,
  generateRandomScramble,
  getSingmasterMove,
  parseSingmasterMove,
} from "./state.ts";

describe("Solved State Initialization", () => {
  it("initializes a solved 54-facelet state", () => {
    const cubies = generateInitialCubies();
    expect(cubies.length).toBe(27);

    const facelets = extractFacelets54(cubies);
    expect(facelets.length).toBe(54);
    expect(facelets).toBe("UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB");

    const evalState = evaluateCubeState(facelets);
    expect(evalState.isSolved).toBe(true);
    expect(evalState.entropy).toBe(0);
    expect(evalState.llmPromptSnippet.includes("solved=true")).toBe(true);
  });
});

describe("Clockwise Moves & Notation", () => {
  it("applies standard Singmaster clockwise moves and produces exact notations", () => {
    const cubies = generateInitialCubies();

    const moved = applyMoveToCubies(cubies, createVec3(0, 1, 0), 1, -Math.PI * 0.5);
    const faceletsU = extractFacelets54(moved);
    expect(faceletsU).not.toBe("UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB");

    expect(faceletsU.slice(0, 9)).toBe("UUUUUUUUU");
    expect(faceletsU.slice(9, 18)).toBe("BBBRRRRRR");
    expect(faceletsU.slice(18, 27)).toBe("RRRFFFFFF");
    expect(faceletsU.slice(36, 45)).toBe("FFFLLLLLL");
    expect(faceletsU.slice(45, 54)).toBe("LLLBBBBBB");

    const moveName = getSingmasterMove(createVec3(0, 1, 0), 1, -Math.PI * 0.5);
    expect(moveName).toBe("U");

    const moveNamePrime = getSingmasterMove(createVec3(0, 1, 0), 1, Math.PI * 0.5);
    expect(moveNamePrime).toBe("U'");
  });
});

describe("Move Round-trip & Canonicalization", () => {
  it("guarantees round-trip between parseSingmasterMove and getSingmasterMove for all moves", () => {
    const allMoves = [
      "U",
      "U'",
      "U2",
      "D",
      "D'",
      "D2",
      "R",
      "R'",
      "R2",
      "L",
      "L'",
      "L2",
      "F",
      "F'",
      "F2",
      "B",
      "B'",
      "B2",
      "M",
      "M'",
      "M2",
      "E",
      "E'",
      "E2",
      "S",
      "S'",
      "S2",
    ];

    for (const m of allMoves) {
      const parsed = parseSingmasterMove(m);
      expect(parsed).not.toBeNull();
      const recovered = getSingmasterMove(parsed!.axis, parsed!.layer, parsed!.angle);
      expect(recovered).toBe(m);
    }
  });

  it("canonicalizes negative axis vectors in getSingmasterMove", () => {
    // Negative axis vector canonicalization.
    const move = getSingmasterMove(createVec3(0, -1, 0), -1, Math.PI * 0.5);
    expect(move).toBe("U");
  });
});

describe("Move Sequences & Identity", () => {
  it("restores solved state after 4 identical 90-degree turns (U4 = Identity)", () => {
    let cubies = generateInitialCubies();
    for (let i = 0; i < 4; i++) {
      cubies = applyMoveToCubies(cubies, createVec3(0, 1, 0), 1, -Math.PI * 0.5);
    }

    const facelets = extractFacelets54(cubies);
    expect(facelets).toBe("UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB");
    expect(evaluateCubeState(facelets).isSolved).toBe(true);
  });

  it("restores solved state after 6 sexy-move sequences ((R U R' U') * 6 = Identity)", () => {
    let cubies = generateInitialCubies();
    const sexyMoves = ["R", "U", "R'", "U'"];

    for (let cycle = 0; cycle < 6; cycle++) {
      for (const m of sexyMoves) {
        const parsed = parseSingmasterMove(m);
        expect(parsed).not.toBeNull();
        cubies = applyMoveToCubies(cubies, parsed!.axis, parsed!.layer, parsed!.angle);
      }
    }

    const facelets = extractFacelets54(cubies);
    expect(facelets).toBe("UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB");
    expect(evaluateCubeState(facelets).isSolved).toBe(true);
  });
});

describe("Move Edge Cases & Random Scrambles", () => {
  it("handles edge cases: invalid moves, empty strings, and null returns", () => {
    expect(parseSingmasterMove("")).toBeNull();
    expect(parseSingmasterMove("   ")).toBeNull();
    expect(parseSingmasterMove("INVALID")).toBeNull();
    expect(parseSingmasterMove("Z")).toBeNull();
    expect(getSingmasterMove(createVec3(0, 1, 0), 1, 0)).toBe("");
  });

  it("generates valid random scrambles with no consecutive identical face moves", () => {
    const scramble = generateRandomScramble(25);
    expect(scramble.length).toBe(25);

    let prevBase = "";
    for (const move of scramble) {
      const base = move.charAt(0);
      expect(base).not.toBe(prevBase);
      prevBase = base;
    }

    let cubies = generateInitialCubies();
    for (const moveStr of scramble) {
      const parsed = parseSingmasterMove(moveStr);
      expect(parsed).not.toBeNull();
      cubies = applyMoveToCubies(cubies, parsed!.axis, parsed!.layer, parsed!.angle);
    }
    const facelets = extractFacelets54(cubies);
    const evalState = evaluateCubeState(facelets, scramble);
    expect(evalState.isSolved).toBe(false);
    expect(evalState.entropy).toBeGreaterThan(0);
  });
});
