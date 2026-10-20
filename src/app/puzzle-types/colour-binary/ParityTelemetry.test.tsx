// ASD-STE100 Simplified Technical English comments.
// This test suite verifies the ParityTelemetry component.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ParityTelemetry } from "./ParityTelemetry";
import type { Square } from "./puzzle";

describe("ParityTelemetry", () => {
  it("renders line balance telemetry for empty board", () => {
    const emptyBoard: Square[] = [
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
      ".",
    ];

    render(<ParityTelemetry size={4} squares={emptyBoard} />);
    expect(screen.getByText("Rows balanced: 0 of 4")).toBeInTheDocument();
  });

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
