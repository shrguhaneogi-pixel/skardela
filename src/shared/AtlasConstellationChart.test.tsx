// ASD-STE100 Simplified Technical English comments.
// This test suite verifies the AtlasConstellationChart component.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AtlasConstellationChart } from "./AtlasConstellationChart";
import type { LogicSkill } from "./logic-atlas";

describe("AtlasConstellationChart", () => {
  it("renders radar constellation chart with skill vertices and labels", () => {
    const mockSkills: LogicSkill[] = [
      {
        id: "balance",
        name: "Parity Balance",
        description: "Even distribution deduction",
        puzzlesCount: 5,
        proficiencyPercent: 80,
      },
      {
        id: "triplet",
        name: "Trio Avoidance",
        description: "Adjacency rule enforcement",
        puzzlesCount: 4,
        proficiencyPercent: 65,
      },
      {
        id: "intersection",
        name: "Ray Intersect",
        description: "Cross word intersection constraints",
        puzzlesCount: 3,
        proficiencyPercent: 90,
      },
      {
        id: "elimination",
        name: "Letter Elimination",
        description: "Exclusion of absent letters",
        puzzlesCount: 2,
        proficiencyPercent: 40,
      },
    ];

    render(<AtlasConstellationChart skills={mockSkills} />);
    expect(screen.getByTitle(/Reasoning skills constellation chart/iu)).toBeInTheDocument();
    expect(screen.getByText("Parity Balance")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });
});
