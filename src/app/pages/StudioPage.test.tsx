import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StudioPage } from "./StudioPage";
import { text } from "../../text/en";

describe("StudioPage", () => {
  it("renders studio header and privacy disclaimer", () => {
    render(<StudioPage />);
    expect(
      screen.getByRole("heading", { name: new RegExp(text.studio.title, "u") }),
    ).toBeInTheDocument();
    expect(screen.getByText(text.studio.disclaimer)).toBeInTheDocument();
  });

  it("cycles cell colours on click", () => {
    render(<StudioPage />);
    const cells = screen.getAllByRole("button", { name: /Row 1, Column 1/u });
    const cell = cells[0];
    expect(cell).toBeDefined();

    fireEvent.click(cell as HTMLElement);
    expect(cell).toHaveAttribute("aria-label", expect.stringContaining("R"));
    fireEvent.click(cell as HTMLElement);
    expect(cell).toHaveAttribute("aria-label", expect.stringContaining("B"));
    fireEvent.click(cell as HTMLElement);
    expect(cell).toHaveAttribute("aria-label", expect.stringContaining("."));
  });

  it("changes grid size when difficulty changes", () => {
    render(<StudioPage />);
    const select = screen.getByLabelText(text.studio.difficultyLabel);
    fireEvent.change(select, { target: { value: "medium" } });
    const cells = screen.getAllByRole("button", { name: /Row \d+, Column \d+/u });
    expect(cells).toHaveLength(36);
  });

  it("switches to raw json tab and validates syntax errors", () => {
    render(<StudioPage />);
    const jsonTab = screen.getByRole("tab", { name: text.studio.tabJson });
    fireEvent.click(jsonTab);

    const textarea = screen.getByLabelText("Custom puzzle JSON");
    fireEvent.change(textarea, { target: { value: "invalid json string" } });

    const validateBtn = screen.getByRole("button", {
      name: new RegExp(text.studio.validateBtn, "u"),
    });
    fireEvent.click(validateBtn);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(text.studio.jsonInvalid)).toBeInTheDocument();
  });
});
