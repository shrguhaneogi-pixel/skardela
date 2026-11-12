import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Textarea } from "./Textarea";

// ASD-STE100 Simplified Technical English comments.
// This test suite verifies runtime rendering, class merging, and accessibility of UI primitives.

describe("Button and Badge primitives", () => {
  it("renders Button with default button type and merged classes", () => {
    const onClick = vi.fn<() => void>();
    render(
      <Button variant="secondary" size="sm" className="rounded-full" onClick={onClick}>
        Action
      </Button>,
    );

    const btn = screen.getByRole("button", { name: "Action" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn.className).toContain("rounded-full");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders Badge variants cleanly", () => {
    render(
      <>
        <Badge>Default</Badge>
        <Badge variant="success">Done</Badge>
      </>,
    );

    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("Done").className).toContain("text-[var(--green)]");
  });
});

describe("Card, Input, and Textarea primitives", () => {
  it("renders Card subcomponents with valid display font utility", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Heading</CardTitle>
          <CardDescription>Summary text</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    const heading = screen.getByRole("heading", { level: 3, name: "Card Heading" });
    expect(heading.className).toContain("font-display");
    expect(heading.className).not.toContain("font-[var(--font-display)]");
    expect(screen.getByText("Summary text")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders Input and Textarea with valid monospace utility and merged width", () => {
    render(
      <>
        <Input aria-label="Puzzle ID" className="w-auto" defaultValue="cb-01" />
        <Textarea aria-label="Puzzle JSON" defaultValue="{}" />
      </>,
    );

    const input = screen.getByLabelText("Puzzle ID");
    expect(input).toHaveValue("cb-01");
    expect(input.className).toContain("w-auto");
    expect(input.className).not.toContain("w-full");

    const textarea = screen.getByLabelText("Puzzle JSON");
    expect(textarea).toHaveValue("{}");
    expect(textarea.className).toContain("font-mono");
    expect(textarea.className).not.toContain("font-[var(--mono)]");
  });
});

describe("Dialog primitive", () => {
  it("opens and closes Dialog with accessible title and description", () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog heading</DialogTitle>
            <DialogDescription>Dialog details</DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const title = screen.getByRole("heading", { name: "Dialog heading" });
    expect(title.className).toContain("font-display");
    expect(title.className).not.toContain("font-[var(--font-display)]");
    expect(screen.getByText("Dialog details")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Select primitive", () => {
  it("renders Select trigger and opens accessible listbox options", () => {
    const onValueChange = vi.fn<(value: string) => void>();
    Element.prototype.scrollIntoView = vi.fn<() => void>();
    Element.prototype.hasPointerCapture = vi.fn<() => boolean>(() => false);
    Element.prototype.releasePointerCapture = vi.fn<() => void>();

    render(
      <Select defaultValue="easy" onValueChange={onValueChange}>
        <SelectTrigger aria-label="Difficulty">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox", { name: "Difficulty" });
    expect(trigger).toHaveTextContent("Easy");

    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "Medium" }));
    expect(onValueChange).toHaveBeenCalledWith("medium");
    expect(trigger).toHaveTextContent("Medium");
  });
});
