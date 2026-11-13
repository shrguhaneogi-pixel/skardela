import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KeyList, RuleList } from "./RuleList";

describe("rule list", () => {
  it("shows a symbol of a rule in its colour, and a screen reader reads only the text", () => {
    render(
      <RuleList
        rules={[
          "A plain rule.",
          { parts: ["A red filter ", { symbol: "●", colour: "red" }, " lets red light through."] },
        ]}
      />,
    );
    const [plain, coloured] = screen.getAllByRole("listitem");
    expect(plain).toHaveTextContent("A plain rule.");
    expect(coloured).toHaveTextContent("A red filter ● lets red light through.");
    const mark = screen.getByText("●");
    expect(mark).toHaveAttribute("data-colour", "red");
    expect(mark).toHaveAttribute("aria-hidden", "true");
  });

  it("renders a key list of items with sample squares", () => {
    render(
      <KeyList
        label="Rules key"
        items={[
          { text: "water bends the beam", sample: { fill: "water", symbol: "" } },
          { text: "red ball", sample: { fill: "red", symbol: "●" } },
        ]}
      />,
    );
    const list = screen.getByRole("list", { name: "Rules key" });
    expect(list).toBeInTheDocument();
    expect(screen.getByText("water bends the beam")).toBeInTheDocument();
    expect(screen.getByText("red ball")).toBeInTheDocument();
  });
});
