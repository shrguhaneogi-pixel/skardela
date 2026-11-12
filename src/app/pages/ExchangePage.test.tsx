import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ExchangePage } from "./ExchangePage";
import { loadPuzzle } from "../puzzles";
import type { PuzzlePack } from "../../shared/puzzle-pack";
import { text } from "../../text/en";

describe("ExchangePage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders exchange header and local-only disclaimer", () => {
    render(
      <MemoryRouter>
        <ExchangePage />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: new RegExp(text.exchange.title, "u") }),
    ).toBeInTheDocument();
    expect(screen.getByText(text.exchange.disclaimer)).toBeInTheDocument();
    expect(screen.getByText(text.exchange.serverRequirementsNote)).toBeInTheDocument();
  });

  it("loads and displays sample pack on button click", () => {
    render(
      <MemoryRouter>
        <ExchangePage />
      </MemoryRouter>,
    );
    const sampleBtn = screen.getByRole("button", { name: text.exchange.exportSampleBtn });
    fireEvent.click(sampleBtn);

    expect(screen.getByText("Curated Logic Starter Pack")).toBeInTheDocument();
    expect(screen.getByText(/CC-BY-4.0/u)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});

describe("ExchangePage custom pack links", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("imports a custom pack and links to a loadable pack puzzle", async () => {
    const customPack: PuzzlePack = {
      format: "skardela-pack-v1",
      id: "custom-pack-99",
      title: "Custom Pack 99",
      author: "Tester",
      version: "1.0.0",
      license: "CC-BY-4.0",
      puzzles: [
        {
          id: "colour-binary-9999",
          type: "colour-binary",
          difficulty: "easy",
          author: "Tester",
          license: "CC-BY-4.0",
          start: ["R..R", "R.BR", "..RB", "..R."],
          answer: ["RBBR", "RBBR", "BRRB", "BRRB"],
        },
      ],
    };

    render(
      <MemoryRouter>
        <ExchangePage />
      </MemoryRouter>,
    );

    const textarea = screen.getByLabelText("Paste puzzle pack JSON");
    fireEvent.change(textarea, { target: { value: JSON.stringify(customPack) } });
    fireEvent.click(screen.getByRole("button", { name: text.exchange.importBtn }));

    const link = screen.getByRole("link", { name: "#colour-binary-9999" });
    expect(link).toHaveAttribute("href", "/puzzles/colour-binary-9999?pack=custom-pack-99");

    const loadedWithPack = await loadPuzzle("colour-binary-9999", "custom-pack-99");
    expect(loadedWithPack?.puzzle.id).toBe("colour-binary-9999");

    const loadedFallback = await loadPuzzle("colour-binary-9999");
    expect(loadedFallback?.puzzle.id).toBe("colour-binary-9999");
  });
});
