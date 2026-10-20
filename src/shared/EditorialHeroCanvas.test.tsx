// ASD-STE100 Simplified Technical English comments.
// This test suite verifies the EditorialHeroCanvas component.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { text } from "../text/en";
import { setupContextListeners } from "./editorial-canvas-gl";
import { EditorialHeroCanvas } from "./EditorialHeroCanvas";

describe("EditorialHeroCanvas rendering", () => {
  it("renders safely with fallback svg and accessible label when webgl is unavailable", () => {
    const { container } = render(<EditorialHeroCanvas />);

    const wrapper = screen.getByLabelText(text.home.canvasAria);
    expect(wrapper).toBeInTheDocument();

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});

describe("EditorialHeroCanvas lifecycle events", () => {
  it("handles webgl context lifecycle events safely without throwing", () => {
    const { container, unmount } = render(<EditorialHeroCanvas />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();

    let lostCalled = false;
    let restoredCalled = false;
    const cleanup = setupContextListeners(
      canvas!,
      () => {
        lostCalled = true;
      },
      () => {
        restoredCalled = true;
      },
    );

    const lostEvent = new Event("webglcontextlost", { cancelable: true });
    canvas?.dispatchEvent(lostEvent);
    expect(lostEvent.defaultPrevented).toBe(true);
    expect(lostCalled).toBe(true);

    const restoreEvent = new Event("webglcontextrestored");
    canvas?.dispatchEvent(restoreEvent);
    expect(restoredCalled).toBe(true);

    cleanup();
    expect(() => unmount()).not.toThrow();
  });

  it("handles document visibilitychange without throwing errors", () => {
    const { unmount } = render(<EditorialHeroCanvas />);

    expect(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    }).not.toThrow();

    expect(() => unmount()).not.toThrow();
  });
});
