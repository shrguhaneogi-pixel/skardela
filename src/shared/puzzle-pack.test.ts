import { describe, it, expect } from "vitest";
import { validatePuzzlePack, parsePuzzlePackJson, type PuzzlePack } from "./puzzle-pack";

const validPack: PuzzlePack = {
  format: "skardela-pack-v1",
  id: "test-pack-01",
  title: "Test Pack",
  author: "Author",
  version: "1.0.0",
  license: "CC-BY-4.0",
  puzzles: [
    {
      id: "colour-binary-9999",
      type: "colour-binary",
      difficulty: "easy",
      author: "Author",
      license: "CC-BY-4.0",
      start: ["R..R", "R.BR", "..RB", "..R."],
      answer: ["RBBR", "RBBR", "BRRB", "BRRB"],
    },
  ],
};

describe("puzzle pack validation", () => {
  it("validates a conforming pack schema", () => {
    const res = validatePuzzlePack(validPack);
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it("rejects non-conforming format or missing license", () => {
    const bad = { ...validPack, format: "unknown-format", license: "PROPRIETARY" };
    const res = validatePuzzlePack(bad);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it("parses valid json string into PuzzlePack", () => {
    const json = JSON.stringify(validPack);
    const res = parsePuzzlePackJson(json);
    expect(res.valid).toBe(true);
    expect(res.pack?.id).toBe("test-pack-01");
  });

  it("rejects invalid json syntax", () => {
    const res = parsePuzzlePackJson("not valid json");
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("Invalid JSON syntax.");
  });
});
