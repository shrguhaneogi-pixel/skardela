// ASD-STE100 Simplified Technical English comments.
// This test suite verifies the ParityTelemetry component.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ParityTelemetry } from "./ParityTelemetry";
import type { Square } from "./puzzle";

describe("ParityTelemetry - initial and partial states", () => {
  it("renders line balance telemetry for empty board", () => {
    const emptyBoard = Array.from({ length: 16 }, () => "." as Square);

    render(<ParityTelemetry size={4} squares={emptyBoard} />);
    expect(screen.getByText("Rows 0/4 • Cols 0/4")).toBeInTheDocument();
    expect(screen.getByText("Rows 0/4")).toBeInTheDocument();
    expect(screen.getByText("Cols 0/4")).toBeInTheDocument();
  });

  it("reports partial balance with accurate row and column metrics", () => {
    const partialBoard: Square[] = [
      "R",
      "R",
      "B",
      "B",
      "R",
      "R",
      "B",
      "B",
      "R",
      "R",
      "B",
      "B",
      "R",
      "R",
      "B",
      "B",
    ];

    render(<ParityTelemetry size={4} squares={partialBoard} />);
    expect(screen.getByText("Rows 4/4 • Cols 0/4")).toBeInTheDocument();
    expect(screen.getByText("Rows 4/4")).toBeInTheDocument();
    expect(screen.getByText("Cols 0/4")).toBeInTheDocument();
  });
});

describe("ParityTelemetry - solved state", () => {
  it("identifies fully balanced board correctly", () => {
    const balancedBoard: Square[] = [
      "R",
      "R",
      "B",
      "B",
      "B",
      "B",
      "R",
      "R",
      "R",
      "B",
      "R",
      "B",
      "B",
      "R",
      "B",
      "R",
    ];

    render(<ParityTelemetry size={4} squares={balancedBoard} />);
    expect(screen.getByText(/All lines are balanced/iu)).toBeInTheDocument();
  });
});
