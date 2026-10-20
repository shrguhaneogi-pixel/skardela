// ASD-STE100 Simplified Technical English comments.
// This test suite verifies the EditorialPuzzleDiagram component.

import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { EditorialPuzzleDiagram } from "./EditorialPuzzleDiagram";
import { savePuzzleProgress } from "./puzzle-progress";

describe("EditorialPuzzleDiagram rendering", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders an accessible diagram for colour-binary", () => {
    render(
      <EditorialPuzzleDiagram
        type="colour-binary"
        levels={[{ id: "colour-binary-0001", difficulty: "easy" }]}
      />,
    );
    expect(screen.getByTitle(/interactive diagram for colour binary/iu)).toBeInTheDocument();
    expect(screen.getByText("CB")).toBeInTheDocument();
  });

  it("renders an accessible diagram for guzzle", () => {
    render(
      <EditorialPuzzleDiagram type="guzzle" levels={[{ id: "guzzle-0001", difficulty: "easy" }]} />,
    );
    expect(screen.getByTitle(/interactive diagram for guzzle/iu)).toBeInTheDocument();
    expect(screen.getByText("GZ")).toBeInTheDocument();
  });
});

describe("EditorialPuzzleDiagram solved state reactivity", () => {
  it("reacts to solved puzzle state in local storage", () => {
    localStorage.clear();
    savePuzzleProgress({
      puzzleId: "colour-binary-0001",
      puzzleType: "colour-binary",
      difficulty: "easy",
      savedAt: Date.now(),
      isSolved: true,
      timeSpentSeconds: 60,
      hintCount: 0,
      mistakes: 0,
    });

    const { container } = render(
      <EditorialPuzzleDiagram
        type="colour-binary"
        levels={[{ id: "colour-binary-0001", difficulty: "easy" }]}
      />,
    );

    const wrapper = container.querySelector("[data-solved='true']");
    expect(wrapper).not.toBeNull();
  });
});

describe("EditorialPuzzleDiagram medium board scaling", () => {
  it("scales and renders all 36 cells for medium 6x6 colour-binary puzzle", () => {
    localStorage.clear();
    const mediumSquares = "RRRRRRBBBBBBRRRRRRBBBBBBRRRRRRBBBBBB".split("");
    savePuzzleProgress({
      puzzleId: "colour-binary-medium-01",
      puzzleType: "colour-binary",
      difficulty: "medium",
      savedAt: Date.now(),
      isSolved: false,
      timeSpentSeconds: 30,
      hintCount: 0,
      mistakes: 0,
      colourBinaryState: { squares: mediumSquares },
    });

    const { container } = render(
      <EditorialPuzzleDiagram
        type="colour-binary"
        levels={[{ id: "colour-binary-medium-01", difficulty: "medium" }]}
      />,
    );

    const dots = container.querySelectorAll("circle");
    expect(dots.length).toBe(36);
  });
});

describe("EditorialPuzzleDiagram progress priority", () => {
  it("prioritizes active in-progress level over previously solved level", () => {
    localStorage.clear();
    savePuzzleProgress({
      puzzleId: "colour-binary-easy-01",
      puzzleType: "colour-binary",
      difficulty: "easy",
      savedAt: Date.now(),
      isSolved: true,
      timeSpentSeconds: 45,
      hintCount: 0,
      mistakes: 0,
    });
    savePuzzleProgress({
      puzzleId: "colour-binary-medium-01",
      puzzleType: "colour-binary",
      difficulty: "medium",
      savedAt: Date.now(),
      isSolved: false,
      timeSpentSeconds: 20,
      hintCount: 0,
      mistakes: 0,
      colourBinaryState: { squares: Array.from({ length: 36 }, () => "R") },
    });

    const { container } = render(
      <EditorialPuzzleDiagram
        type="colour-binary"
        levels={[
          { id: "colour-binary-easy-01", difficulty: "easy" },
          { id: "colour-binary-medium-01", difficulty: "medium" },
        ]}
      />,
    );

    const dots = container.querySelectorAll("circle");
    expect(dots.length).toBe(36);
    expect(container.querySelector("[data-solved='true']")).toBeNull();
  });
});
