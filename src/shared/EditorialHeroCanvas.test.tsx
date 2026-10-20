// ASD-STE100 Simplified Technical English comments.
// This test suite verifies the EditorialHeroCanvas component.

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditorialHeroCanvas } from "./EditorialHeroCanvas";

describe("EditorialHeroCanvas", () => {
  it("renders safely with fallback svg when webgl is unavailable", () => {
    const { container } = render(<EditorialHeroCanvas />);

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    expect(container.textContent).toContain("SYS.CHRONICLE // SPEC 01");
    expect(container.textContent).toContain("LAB COORDINATE MATRIX");
  });
});
