import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { Button } from "../shared/ui/Button";
import { buttonVariants } from "../shared/ui/button-variants";
import { Input } from "../shared/ui/Input";
import { GraduatedHint } from "../shared/GraduatedHint";
import { ValidationReport } from "./pages/ValidationReport";
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

describe("a11y regression: light mode contrast invariants (WCAG 2.1 AA)", () => {
  it("satisfies minimum 4.5:1 text contrast in light mode", () => {
    // --text: #374151 on --bg: #f8f9fa
    const textContrast = getContrastRatio("#374151", "#f8f9fa");
    expect(textContrast).toBeGreaterThanOrEqual(4.5);

    // --text-h: #0f172a on --bg: #f8f9fa
    const headingContrast = getContrastRatio("#0f172a", "#f8f9fa");
    expect(headingContrast).toBeGreaterThanOrEqual(4.5);

    // --text-muted: #5f6775 on --bg: #f8f9fa
    const mutedContrast = getContrastRatio("#5f6775", "#f8f9fa");
    expect(mutedContrast).toBeGreaterThanOrEqual(4.5);

    // --accent-text: #c2410c on #ffffff
    const accentContrast = getContrastRatio("#c2410c", "#ffffff");
    expect(accentContrast).toBeGreaterThanOrEqual(4.5);

    // --state-error-text: #b91c1c on --bg: #f8f9fa
    const errorContrast = getContrastRatio("#b91c1c", "#f8f9fa");
    expect(errorContrast).toBeGreaterThanOrEqual(4.5);

    // --state-success-text: #166534 on --bg: #f8f9fa
    const successContrast = getContrastRatio("#166534", "#f8f9fa");
    expect(successContrast).toBeGreaterThanOrEqual(4.5);
  });
});

describe("a11y regression: dark mode contrast invariants (WCAG 2.1 AA)", () => {
  it("satisfies minimum 4.5:1 text contrast in dark mode", () => {
    // --text: #d1d5db on --bg: #0d0f14
    const textContrast = getContrastRatio("#d1d5db", "#0d0f14");
    expect(textContrast).toBeGreaterThanOrEqual(4.5);

    // --text-h: #f8fafc on --bg: #0d0f14
    const headingContrast = getContrastRatio("#f8fafc", "#0d0f14");
    expect(headingContrast).toBeGreaterThanOrEqual(4.5);

    // --text-muted: #9ca3af on --bg: #0d0f14
    const mutedContrast = getContrastRatio("#9ca3af", "#0d0f14");
    expect(mutedContrast).toBeGreaterThanOrEqual(4.5);

    // --accent: #fb923c on #0d0f14
    const accentContrast = getContrastRatio("#fb923c", "#0d0f14");
    expect(accentContrast).toBeGreaterThanOrEqual(4.5);

    // --state-error-text: #f87171 on --bg: #0d0f14
    const errorContrast = getContrastRatio("#f87171", "#0d0f14");
    expect(errorContrast).toBeGreaterThanOrEqual(4.5);

    // --state-success-text: #4ade80 on --bg: #0d0f14
    const successContrast = getContrastRatio("#4ade80", "#0d0f14");
    expect(successContrast).toBeGreaterThanOrEqual(4.5);
  });
});

describe("a11y regression: touch target dimensions (WCAG AA >= 44x44px)", () => {
  it("enforces minimum 44px (11 units / 2.75rem) on all button variants", () => {
    const defaultClasses = buttonVariants({ size: "default" });
    const smClasses = buttonVariants({ size: "sm" });
    const lgClasses = buttonVariants({ size: "lg" });
    const pillClasses = buttonVariants({ size: "pill" });

    // 11 units in Tailwind = 44px = 2.75rem
    expect(defaultClasses).toContain("min-h-11");
    expect(defaultClasses).toContain("min-w-11");
    expect(smClasses).toContain("min-h-11");
    expect(smClasses).toContain("min-w-11");
    expect(lgClasses).toContain("min-h-12");
    expect(lgClasses).toContain("min-w-12");
    expect(pillClasses).toContain("min-h-11");
    expect(pillClasses).toContain("min-w-11");
  });

  it("renders Button and Input primitives with touch target classes", () => {
    render(
      <>
        <Button>Test Button</Button>
        <Input aria-label="Test Input" />
      </>,
    );

    const btn = screen.getByRole("button", { name: "Test Button" });
    expect(btn.className).toContain("min-h-11");
    expect(btn.className).toContain("min-w-11");

    const input = screen.getByLabelText("Test Input");
    expect(input.className).toContain("min-h-11");
  });
});

describe("a11y regression: live regions and announcements", () => {
  it("renders ValidationReport with output and polite live region for success", () => {
    render(<ValidationReport result={{ valid: true, errors: [] }} />);

    const output = screen.getByRole("status");
    expect(output.tagName.toLowerCase()).toBe("output");
    expect(output).toHaveAttribute("aria-live", "polite");
    expect(output).toHaveTextContent(text.studio.validSuccess);
  });

  it("renders ValidationReport with alert and assertive live region for errors", () => {
    render(<ValidationReport result={{ valid: false, errors: ["Invalid grid dimension"] }} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveTextContent("Invalid grid dimension");
  });

  it("renders GraduatedHint with polite live region announcement", () => {
    const hint = {
      index: 0,
      tier: "nudge" as const,
      highlightIndices: [0],
      nudge: "Look at this row",
      explanation: "Three blues cannot be adjacent",
      solution: "Place red here",
      ruleType: "no-three-in-a-row",
    };

    render(<GraduatedHint hint={hint} onTierChange={() => {}} onDismiss={() => {}} />);

    const hintSection = screen.getByRole("region", { name: text.hints.title });
    expect(hintSection).toHaveAttribute("aria-live", "polite");
  });
});
