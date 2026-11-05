// ASD-STE100 Simplified Technical English comments.
// Unit tests for Rubik's Cube spring physics, momentum flick, and velocity tracking.

import { describe, expect, it } from "vitest";
import {
  computeSnapAngle,
  createSpringState,
  DEFAULT_SPRING_CONFIG,
  stepSpring,
  VelocityTracker,
} from "./spring.ts";

describe("Spring Snap Angles", () => {
  it("computes snap angle to nearest 90-degree quadrant", () => {
    const snap1 = computeSnapAngle(1.1, 0, DEFAULT_SPRING_CONFIG);
    expect(Math.abs(snap1 - Math.PI * 0.5)).toBeLessThan(1e-4);

    const snap2 = computeSnapAngle(0.1, 0, DEFAULT_SPRING_CONFIG);
    expect(snap2).toBe(0);

    const snap3 = computeSnapAngle(-1.2, 0, DEFAULT_SPRING_CONFIG);
    expect(Math.abs(snap3 - -Math.PI * 0.5)).toBeLessThan(1e-4);
  });

  it("triggers momentum flick when pointer release velocity exceeds threshold", () => {
    // Current angle is small (0.2), but user flicked fast positive.
    const flickSnap = computeSnapAngle(0.2, 4.5, DEFAULT_SPRING_CONFIG);
    expect(Math.abs(flickSnap - Math.PI * 0.5)).toBeLessThan(1e-4);

    // Negative fast flick.
    const negFlickSnap = computeSnapAngle(-0.2, -4.5, DEFAULT_SPRING_CONFIG);
    expect(Math.abs(negFlickSnap - -Math.PI * 0.5)).toBeLessThan(1e-4);
  });
});

describe("Spring Simulation Physics", () => {
  it("steps spring simulation until equilibrium settling", () => {
    let state = createSpringState(0.5);
    state.target = Math.PI * 0.5;
    state.isSettled = false;

    // Simulate spring physics for 60 frames (1 second at 60fps).
    for (let frame = 0; frame < 60; frame++) {
      state = stepSpring(state, 1.0 / 60.0, DEFAULT_SPRING_CONFIG);
    }

    expect(state.isSettled).toBe(true);
    expect(Math.abs(state.position - Math.PI * 0.5)).toBeLessThan(1e-4);
    expect(state.velocity).toBe(0);
  });

  it("tracks pointer velocity smoothly", () => {
    const tracker = new VelocityTracker();
    tracker.reset(0, 1000);
    // 0.1 rad in 50ms = 2.0 rad/s.
    tracker.update(0.1, 1050);
    tracker.update(0.2, 1100);
    expect(tracker.getVelocity()).toBeGreaterThan(1.0);
  });

  it("spring clamps delta time under heavy frame drops to prevent instability", () => {
    const state = createSpringState(1.2);
    state.target = Math.PI * 0.5;
    state.isSettled = false;

    // Simulate a massive 5.0 second lag spike. Clamping prevents numerical explosion.
    const stepped = stepSpring(state, 5.0, DEFAULT_SPRING_CONFIG);
    expect(Number.isNaN(stepped.position)).toBe(false);
    expect(Number.isNaN(stepped.velocity)).toBe(false);
    expect(Math.abs(stepped.velocity)).toBeLessThan(100);
  });
});
