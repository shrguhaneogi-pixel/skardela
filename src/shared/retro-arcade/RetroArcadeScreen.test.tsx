/* oxlint-disable eslint/max-lines-per-function */
// ASD-STE100 Simplified Technical English comments.
// Tests for RetroArcadeScreen component and CRT WebGL helpers.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { text } from "../../text/en";
import { cleanupCrtGl, initCrtGl, renderCrtFrame, type CrtGlContext } from "./retro-crt-gl";
import { RetroArcadeScreen } from "./RetroArcadeScreen";

describe("RetroArcadeScreen rendering and controls", () => {
  it("renders arcade cabinet, stage, and controls", () => {
    const { container } = render(<RetroArcadeScreen />);
    expect(screen.getByRole("button", { name: text.cubeAgent.scramble })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: text.cubeAgent.reset })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: text.arcade.disableCrt })).toBeInTheDocument();
    expect(container.querySelector("canvas[aria-hidden='true']")).toBeInTheDocument();
  });

  it("toggles CRT canvas on and off when toggle button is selected", async () => {
    const user = userEvent.setup();
    const { container } = render(<RetroArcadeScreen />);

    const toggleBtn = screen.getByRole("button", { name: text.arcade.disableCrt });
    expect(container.querySelector("canvas[aria-hidden='true']")).toBeInTheDocument();

    await user.click(toggleBtn);
    expect(screen.getByRole("button", { name: text.arcade.enableCrt })).toBeInTheDocument();
    expect(container.querySelector("canvas[aria-hidden='true']")).toBeNull();

    await user.click(screen.getByRole("button", { name: text.arcade.enableCrt }));
    expect(screen.getByRole("button", { name: text.arcade.disableCrt })).toBeInTheDocument();
    expect(container.querySelector("canvas[aria-hidden='true']")).toBeInTheDocument();
  });

  it("handles scramble and reset clicks safely", async () => {
    const user = userEvent.setup();
    render(<RetroArcadeScreen />);

    const scrambleBtn = screen.getByRole("button", { name: text.cubeAgent.scramble });
    const resetBtn = screen.getByRole("button", { name: text.cubeAgent.reset });

    await user.click(scrambleBtn);
    expect(scrambleBtn).toBeInTheDocument();

    await user.click(resetBtn);
    expect(resetBtn).toBeInTheDocument();
  });
});

describe("RetroArcadeScreen WebGL events", () => {
  it("handles webglcontextlost and webglcontextrestored events on the CRT canvas", () => {
    const { container } = render(<RetroArcadeScreen />);
    const canvas = container.querySelector("canvas[aria-hidden='true']") as HTMLCanvasElement;
    expect(canvas).not.toBeNull();

    const lostEvent = new Event("webglcontextlost", { cancelable: true });
    canvas.dispatchEvent(lostEvent);
    expect(lostEvent.defaultPrevented).toBe(true);

    const restoredEvent = new Event("webglcontextrestored");
    canvas.dispatchEvent(restoredEvent);
    expect(canvas).toBeInTheDocument();
  });
});

describe("retro-crt-gl pipeline", () => {
  it("returns null when webgl2 is not supported on canvas", () => {
    const canvas = document.createElement("canvas");
    const ctx = initCrtGl(canvas);
    expect(ctx).toBeNull();
  });

  it("cleans up resources when cleanupCrtGl is invoked", () => {
    const deleteBuffer = vi.fn<(buffer: WebGLBuffer) => void>();
    const deleteVertexArray = vi.fn<(vao: WebGLVertexArrayObject) => void>();
    const deleteProgram = vi.fn<(program: WebGLProgram) => void>();

    const mockCtx = {
      gl: {
        deleteBuffer,
        deleteVertexArray,
        deleteProgram,
      } as unknown as WebGL2RenderingContext,
      program: {} as WebGLProgram,
      buffer: {} as WebGLBuffer,
      vao: {} as WebGLVertexArrayObject,
      locations: {
        resolution: null,
        time: null,
        powerOn: null,
      },
    } satisfies CrtGlContext;

    cleanupCrtGl(mockCtx);
    expect(deleteBuffer).toHaveBeenCalledWith(mockCtx.buffer);
    expect(deleteVertexArray).toHaveBeenCalledWith(mockCtx.vao);
    expect(deleteProgram).toHaveBeenCalledWith(mockCtx.program);
  });

  it("renders frame with uniform updates and draw call", () => {
    const useProgram = vi.fn<(program: WebGLProgram) => void>();
    const bindVertexArray = vi.fn<(vao: WebGLVertexArrayObject) => void>();
    const viewport = vi.fn<(x: number, y: number, w: number, h: number) => void>();
    const uniform2f = vi.fn<(loc: WebGLUniformLocation | null, x: number, y: number) => void>();
    const uniform1f = vi.fn<(loc: WebGLUniformLocation | null, x: number) => void>();
    const drawArrays = vi.fn<(mode: number, first: number, count: number) => void>();

    const mockCtx = {
      gl: {
        useProgram,
        bindVertexArray,
        viewport,
        uniform2f,
        uniform1f,
        drawArrays,
        TRIANGLES: 4,
      } as unknown as WebGL2RenderingContext,
      program: {} as WebGLProgram,
      buffer: {} as WebGLBuffer,
      vao: {} as WebGLVertexArrayObject,
      locations: {
        resolution: {} as WebGLUniformLocation,
        time: {} as WebGLUniformLocation,
        powerOn: {} as WebGLUniformLocation,
      },
    } satisfies CrtGlContext;

    const canvas = document.createElement("canvas");
    renderCrtFrame(mockCtx, canvas, 0.5);

    expect(useProgram).toHaveBeenCalledWith(mockCtx.program);
    expect(bindVertexArray).toHaveBeenCalledWith(mockCtx.vao);
    expect(uniform2f).toHaveBeenCalledWith(
      mockCtx.locations.resolution,
      canvas.width,
      canvas.height,
    );
    expect(uniform1f).toHaveBeenCalledWith(mockCtx.locations.time, 0.5);
    expect(drawArrays).toHaveBeenCalledWith(4, 0, 6);
  });
});
