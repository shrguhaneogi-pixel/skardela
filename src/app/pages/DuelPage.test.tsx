import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { DuelPage } from "./DuelPage";
import { encodeDuelResult, type DuelResult } from "../../shared/duel";
import { text } from "../../text/en";

const mockOpponentResult: DuelResult = {
  puzzleId: "colour-binary-0001",
  timeSeconds: 120,
  hints: 1,
  mistakes: 2,
  cleanSolve: false,
  date: "2026-10-15",
};

describe("DuelPage", () => {
  it("renders duel header and client-side self-reported disclaimer", () => {
    render(
      <MemoryRouter>
        <DuelPage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: new RegExp(text.duel.title, "u") }),
    ).toBeInTheDocument();
    expect(screen.getByText(text.duel.disclaimer)).toBeInTheDocument();
    expect(screen.getByText(text.duel.futureServerNote)).toBeInTheDocument();
  });

  it("submits opponent code and renders comparison outcome", () => {
    render(
      <MemoryRouter>
        <DuelPage />
      </MemoryRouter>,
    );
    const code = encodeDuelResult(mockOpponentResult);
    const input = screen.getByPlaceholderText(text.duel.pastePlaceholder);
    fireEvent.change(input, { target: { value: code } });

    const submitBtn = screen.getByRole("button", { name: text.duel.compareBtn });
    fireEvent.click(submitBtn);

    expect(screen.getByRole("status")).toHaveTextContent(text.duel.winnerYou);
    expect(screen.getByText(text.duel.yourResultHeading)).toBeInTheDocument();
    expect(screen.getByText(text.duel.opponentResultHeading)).toBeInTheDocument();
  });
});
