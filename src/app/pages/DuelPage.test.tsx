// ASD-STE100 Simplified Technical English comments.
// This test suite verifies the DuelPage and balance bar calculations.

import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { encodeDuelResult, type DuelResult } from "../../shared/duel";
import { text } from "../../text/en";
import { DuelPage } from "./DuelPage";

describe("DuelPage component", () => {
  it("renders duel input form and initial instructions", () => {
    render(
      <MemoryRouter>
        <DuelPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(text.duel.title)).toBeInTheDocument();
    expect(screen.getByLabelText(text.duel.pasteCodeLabel)).toBeInTheDocument();
  });

  it("compares results accurately and renders accessible composite balance meter", () => {
    render(
      <MemoryRouter>
        <DuelPage />
      </MemoryRouter>,
    );

    const opponent: DuelResult = {
      puzzleId: "colour-binary-0001",
      timeSeconds: 120,
      hints: 1,
      mistakes: 2,
      cleanSolve: false,
      date: "2026-10-15",
    };

    const code = encodeDuelResult(opponent);
    const input = screen.getByLabelText(text.duel.pasteCodeLabel);
    fireEvent.change(input, { target: { value: code } });

    const submitBtn = screen.getByText(text.duel.compareBtn);
    fireEvent.click(submitBtn);

    expect(screen.getByText(text.duel.winnerYou)).toBeInTheDocument();

    const meter = screen.getByRole("meter");
    expect(meter).toBeInTheDocument();
    const valueNow = Number(meter.getAttribute("aria-valuenow"));
    // Player won all 3 categories (time, hints, mistakes), so player advantage must be > 50%
    expect(valueNow).toBeGreaterThan(50);
  });
});
