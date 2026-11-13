import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// ASD-STE100 Simplified Technical English comments.
// This test suite verifies stylesheet accessibility rules.

describe("a11y regression: media queries and focus outlines", () => {
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

describe("a11y regression: core touch targets", () => {
  const boardCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/shared/Board.module.css"),
    "utf-8",
  );
  const guzzleCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/puzzle-types/guzzle/Board.module.css"),
    "utf-8",
  );
  const themeSwitcherCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/ThemeSwitcher.module.css"),
    "utf-8",
  );
  const layoutCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/Layout.module.css"),
    "utf-8",
  );

  it("includes touch target dimensions in core layout stylesheets", () => {
    expect(themeSwitcherCss).toContain("min-height: 2.75rem;");
    expect(themeSwitcherCss).toContain("min-width: 2.75rem;");

    expect(boardCss).toContain("min-width: 2.75rem;");
    expect(boardCss).toContain("min-height: 2.75rem;");

    expect(guzzleCss).toContain("min-width: 2.75rem;");
    expect(guzzleCss).toContain("min-height: 2.75rem;");

    expect(layoutCss).toContain("min-height: 2.75rem;");
    expect(layoutCss).toContain("min-width: 2.75rem;");
  });
});

describe("a11y regression: page and module touch targets", () => {
  const cubeCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/shared/rubiks-3d/AgentCubeInterface.module.css"),
    "utf-8",
  );
  const studioCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/pages/StudioPage.module.css"),
    "utf-8",
  );
  const archiveCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/pages/ArchivePage.module.css"),
    "utf-8",
  );

  it("includes touch target dimensions in page and 3D module stylesheets", () => {
    expect(cubeCss).toContain("min-height: 2.75rem;");
    expect(cubeCss).toContain("min-width: 2.75rem;");

    expect(studioCss).toContain("min-height: 2.75rem;");
    expect(studioCss).toContain("min-width: 2.75rem;");

    expect(archiveCss).toContain("min-height: 2.75rem;");
    expect(archiveCss).toContain("min-width: 2.75rem;");
  });
});

describe("a11y regression: focus visible rings in stylesheets", () => {
  const layoutCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/Layout.module.css"),
    "utf-8",
  );
  const cubeCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/shared/rubiks-3d/AgentCubeInterface.module.css"),
    "utf-8",
  );
  const studioCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/pages/StudioPage.module.css"),
    "utf-8",
  );

  it("includes focus visible rings on 3D cube interface and layout controls", () => {
    expect(cubeCss).toContain(":focus-visible");
    expect(cubeCss).toContain("outline: 2px solid var(--accent)");
    expect(cubeCss).toContain("outline-offset: 2px");

    expect(layoutCss).toContain(".siteName:focus-visible");
    expect(studioCss).toContain(".select:focus-visible");
  });
});

describe("a11y regression: mobile responsiveness and containment", () => {
  const indexCss = fs.readFileSync(path.resolve(process.cwd(), "src/index.css"), "utf-8");
  const boardCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/shared/Board.module.css"),
    "utf-8",
  );
  const studioCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/pages/StudioPage.module.css"),
    "utf-8",
  );
  const duelCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/pages/DuelPage.module.css"),
    "utf-8",
  );

  it("includes mobile viewport horizontal scroll containment in index.css and grids", () => {
    expect(indexCss).toContain("overflow-x: hidden");
    expect(boardCss).toContain("min-width: max-content;");
    expect(studioCss).toContain("overflow-x: auto;");
    expect(duelCss).toContain("flex-wrap: wrap;");
  });
});
