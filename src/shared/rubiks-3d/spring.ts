// ASD-STE100 Simplified Technical English comments.
// Spring physics and momentum rotation solver for Rubik's Cube slices.

export interface SpringConfig {
  // Spring stiffness constant k (default 280).
  stiffness: number;
  // Damping constant c (default 28).
  damping: number;
  // Virtual mass m (default 1.0).
  mass: number;
  // Velocity threshold to trigger momentum flick in radians per second.
  flickVelocityThreshold: number;
}

export const DEFAULT_SPRING_CONFIG: SpringConfig = {
  stiffness: 280,
  damping: 28,
  mass: 1.0,
  flickVelocityThreshold: 2.0,
};

export interface SpringState {
  // Current rotation angle in radians.
  position: number;
  // Angular velocity in radians per second.
  velocity: number;
  // Target snap angle in radians.
  target: number;
  isSettled: boolean;
}

export function createSpringState(initialPosition = 0): SpringState {
  return {
    position: initialPosition,
    velocity: 0,
    target: initialPosition,
    isSettled: true,
  };
}

// Calculate the nearest 90-degree snap angle.
export function computeSnapAngle(
  currentAngle: number,
  releaseVelocity: number,
  config: SpringConfig,
): number {
  const halfPi = Math.PI * 0.5;

  // Check if the user flicked with high momentum.
  if (Math.abs(releaseVelocity) >= config.flickVelocityThreshold) {
    const direction = Math.sign(releaseVelocity);
    const forwardAngle = currentAngle + direction * (halfPi * 0.4);
    return Math.round(forwardAngle / halfPi) * halfPi;
  }

  // Standard snap to nearest quadrant.
  return Math.round(currentAngle / halfPi) * halfPi;
}

// Step the damped harmonic oscillator using semi-implicit Euler integration.
export function stepSpring(
  state: SpringState,
  deltaTimeSeconds: number,
  config: SpringConfig = DEFAULT_SPRING_CONFIG,
): SpringState {
  if (state.isSettled) {
    return state;
  }

  // Clamp maximum delta time to prevent divergence during lag.
  const dt = Math.min(deltaTimeSeconds, 0.05);

  const displacement = state.position - state.target;
  const springForce = -config.stiffness * displacement;
  const dampingForce = -config.damping * state.velocity;
  const acceleration = (springForce + dampingForce) / config.mass;

  const newVelocity = state.velocity + acceleration * dt;
  const newPosition = state.position + newVelocity * dt;

  // Check if spring reached equilibrium.
  const posError = Math.abs(newPosition - state.target);
  const velError = Math.abs(newVelocity);

  if (posError < 1e-4 && velError < 1e-3) {
    return {
      position: state.target,
      velocity: 0,
      target: state.target,
      isSettled: true,
    };
  }

  return {
    position: newPosition,
    velocity: newVelocity,
    target: state.target,
    isSettled: false,
  };
}

// Velocity tracker for pointer kinematics during spatial dragging.
export class VelocityTracker {
  private lastTime = 0;
  private lastAngle = 0;
  private currentVelocity = 0;

  public reset(initialAngle = 0, initialTimeMs = Date.now()): void {
    this.lastTime = initialTimeMs;
    this.lastAngle = initialAngle;
    this.currentVelocity = 0;
  }

  public update(angle: number, currentTimeMs = Date.now()): void {
    const dt = (currentTimeMs - this.lastTime) / 1000.0;
    if (dt > 0.001) {
      const instantVelocity = (angle - this.lastAngle) / dt;
      // Exponential moving average for smooth velocity estimation.
      this.currentVelocity = this.currentVelocity * 0.4 + instantVelocity * 0.6;
      this.lastTime = currentTimeMs;
      this.lastAngle = angle;
    }
  }

  public getVelocity(): number {
    return this.currentVelocity;
  }
}
