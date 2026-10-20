// ASD-STE100 Simplified Technical English comments.
// This test suite verifies the WordProgressTelemetry component.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WordProgressTelemetry } from "./WordProgressTelemetry";
import type { Guesses } from "./rules-check";

describe("WordProgressTelemetry", () => {
  it("renders 4 word ray indicators for 3x3 board", () => {
    const guesses: Guesses = [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ];

    render(<WordProgressTelemetry size={3} guesses={guesses} selected={null} />);
    expect(screen.getByText("Across")).toBeInTheDocument();
    expect(screen.getByText("Down")).toBeInTheDocument();
    expect(screen.getByText("Diag ↘")).toBeInTheDocument();
    expect(screen.getByText("Diag ↗")).toBeInTheDocument();
    expect(screen.getByText("Lines solved: 0 of 4")).toBeInTheDocument();
  });

  it("identifies full completion state", () => {
    // 3x3 grid with all playable cells correct.
    // Center square is undefined.
    const guesses: Guesses = [
      { letter: "C", mark: "correct" },
      { letter: "A", mark: "correct" },
      { letter: "T", mark: "correct" },
      { letter: "D", mark: "correct" },
      undefined,
      { letter: "G", mark: "correct" },
      { letter: "P", mark: "correct" },
      { letter: "I", mark: "correct" },
      { letter: "G", mark: "correct" },
    ];

    render(<WordProgressTelemetry size={3} guesses={guesses} selected={null} />);
    expect(screen.getByText(/All words solved/iu)).toBeInTheDocument();
  });
});
