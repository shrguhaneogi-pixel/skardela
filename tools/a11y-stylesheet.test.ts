import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// ASD-STE100 Simplified Technical English comments.
// This test suite verifies stylesheet accessibility rules (reduced-motion, forced-colors, focus).

describe("a11y regression: media queries and stylesheet invariants", () => {
  const indexCss = fs.readFileSync(path.resolve(process.cwd(), "src/index.css"), "utf-8");
  const boardCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/shared/Board.module.css"),
    "utf-8",
  );

  it("includes prefers-reduced-motion media query in index.css", () => {
    expect(indexCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(indexCss).toContain("animation-duration: 0.01ms !important");
    expect(indexCss).toContain("transition-duration: 0.01ms !important");
  });

  it("includes forced-colors high contrast adaptations in Board.module.css", () => {
    expect(boardCss).toContain("@media (forced-colors: active)");
  });

  it("includes :focus-visible outline rule with clear offset", () => {
    expect(indexCss).toContain(":focus-visible");
    expect(indexCss).toContain("outline: 2px solid var(--accent)");
    expect(indexCss).toContain("outline-offset: 2px");
  });
});
