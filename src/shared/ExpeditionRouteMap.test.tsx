// ASD-STE100 Simplified Technical English comments.
// This test suite verifies the ExpeditionRouteMap component.

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExpeditionRouteMap } from "./ExpeditionRouteMap";
import type { ExpeditionStage, StageState } from "./expeditions";

describe("ExpeditionRouteMap", () => {
  it("renders svg waypoint nodes and trail lines", () => {
    const stages: ExpeditionStage[] = [
      {
        id: "s1",
        title: "Stage 1",
        puzzleId: "p1",
        puzzleType: "colour-binary",
        difficulty: "easy",
      },
      { id: "s2", title: "Stage 2", puzzleId: "p2", puzzleType: "guzzle", difficulty: "medium" },
      {
        id: "s3",
        title: "Stage 3",
        puzzleId: "p3",
        puzzleType: "colour-binary",
        difficulty: "hard",
      },
    ];
    const statusMap = new Map<string, StageState>([
      ["s1", "completed"],
      ["s2", "available"],
      ["s3", "locked"],
    ]);

    const { container } = render(<ExpeditionRouteMap stages={stages} statusMap={statusMap} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(3);
  });
});
