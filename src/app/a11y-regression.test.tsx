import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { text } from "../text/en";
import { Layout } from "./Layout";

// ASD-STE100 Simplified Technical English comments.
// This test suite verifies automated accessibility requirements for WCAG 2.1 and 2.2 AA.

const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

// Calculate relative luminance of an sRGB hex colour.
function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// Calculate contrast ratio between two hex colours according to WCAG.
function getContrastRatio(fgHex: string, bgHex: string): number {
  const lum1 = getRelativeLuminance(fgHex);
  const lum2 = getRelativeLuminance(bgHex);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe("a11y regression: layout and landmark navigation", () => {
  it("renders skip-link pointing to main content", () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    );

    const skipLink = screen.getByRole("link", { name: text.skipLink });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main");

    const mainElement = document.querySelector("#main");
    expect(mainElement).not.toBeNull();
    expect(mainElement).toHaveAttribute("tabindex", "-1");
  });

  it("renders labeled navigation landmarks", () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label");
  });
});

describe("a11y regression: color contrast invariants (WCAG 2.1 AA)", () => {
  it("satisfies minimum 4.5:1 text contrast in light mode", () => {
    // --text: #374151 on --bg: #f8f9fa
    const textContrast = getContrastRatio("#374151", "#f8f9fa");
    expect(textContrast).toBeGreaterThanOrEqual(4.5);

    // --text-h: #0f172a on --bg: #f8f9fa
    const headingContrast = getContrastRatio("#0f172a", "#f8f9fa");
    expect(headingContrast).toBeGreaterThanOrEqual(4.5);

    // --accent-text: #c2410c on #ffffff
    const accentContrast = getContrastRatio("#c2410c", "#ffffff");
    expect(accentContrast).toBeGreaterThanOrEqual(4.5);
  });

  it("satisfies minimum 4.5:1 text contrast in dark mode", () => {
    // --text: #d1d5db on --bg: #0d0f14
    const textContrast = getContrastRatio("#d1d5db", "#0d0f14");
    expect(textContrast).toBeGreaterThanOrEqual(4.5);

    // --text-h: #f8fafc on --bg: #0d0f14
    const headingContrast = getContrastRatio("#f8fafc", "#0d0f14");
    expect(headingContrast).toBeGreaterThanOrEqual(4.5);

    // --accent: #fb923c on #0d0f14
    const accentContrast = getContrastRatio("#fb923c", "#0d0f14");
    expect(accentContrast).toBeGreaterThanOrEqual(4.5);
  });
});
