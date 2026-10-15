import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ExchangePage } from "./ExchangePage";
import { text } from "../../text/en";

describe("ExchangePage", () => {
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
  });
});
