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

describe("DuelPage error handling", () => {
  it("shows an accessible error message when an invalid duel code is submitted", () => {
    render(
      <MemoryRouter>
        <DuelPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(text.duel.pasteCodeLabel);
    fireEvent.change(input, { target: { value: "not-a-valid-duel-code" } });
    fireEvent.click(screen.getByText(text.duel.compareBtn));

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(text.duel.invalidCode);
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("clears previous comparison when an invalid duel code is submitted afterward", () => {
    render(
      <MemoryRouter>
        <DuelPage />
      </MemoryRouter>,
    );

    const code = encodeDuelResult({
      puzzleId: "colour-binary-0001",
      timeSeconds: 120,
      hints: 1,
      mistakes: 2,
      cleanSolve: false,
      date: "2026-10-15",
    });
    const input = screen.getByLabelText(text.duel.pasteCodeLabel);
    fireEvent.change(input, { target: { value: code } });
    fireEvent.click(screen.getByText(text.duel.compareBtn));
    expect(screen.getByText(text.duel.winnerYou)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "broken" } });
    fireEvent.click(screen.getByText(text.duel.compareBtn));

    expect(screen.queryByText(text.duel.winnerYou)).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(text.duel.invalidCode);
  });
});
