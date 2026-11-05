// ASD-STE100 Simplified Technical English comments.
// Pure WebGL2 3D Rubik's Cube component with zero external runtime dependencies.
// Solvable by rotating cubies through mouse spatial drag vectors. Fully synchronized with LLM context.

import { useEffect, useRef } from "react";
import { createEmptyDrag, type DragState } from "./rubiks-renderer.ts";
import { createSpringState, type SpringState, VelocityTracker } from "./spring.ts";
import {
  applyMoveToCubies,
  type CubeLLMContext,
  type CubieData,
  evaluateCubeState,
  extractFacelets54,
  generateInitialCubies,
  generateRandomScramble,
  parseSingmasterMove,
} from "./state.ts";
import { type OrbitState, useRubiksPointer } from "./useRubiksPointer.ts";
import { useRubiksRenderLoop } from "./useRubiksRenderLoop.ts";

export interface RubiksCubeCanvasProps {
  onContextUpdate?: (context: CubeLLMContext) => void;
  className?: string;
  autoRotateSpeed?: number;
  scrambleSignal?: number;
  resetSignal?: number;
}

function useCubeSignalsHandler(
  cubiesRef: React.RefObject<CubieData[]>,
  moveHistoryRef: React.RefObject<string[]>,
  springRef: React.RefObject<SpringState>,
  onContextUpdate?: (context: CubeLLMContext) => void,
  scrambleSignal?: number,
  resetSignal?: number,
) {
  useEffect(() => {
    if (scrambleSignal === undefined || scrambleSignal === 0) return;
    const scramble = generateRandomScramble(20);
    let current = cubiesRef.current;
    for (const moveStr of scramble) {
      const parsed = parseSingmasterMove(moveStr);
      if (parsed) {
        current = applyMoveToCubies(current, parsed.axis, parsed.layer, parsed.angle);
      }
    }
    cubiesRef.current = current;
    moveHistoryRef.current = [...scramble];
    const facelets = extractFacelets54(current);
    const last = scramble.at(-1);
    const context = evaluateCubeState(facelets, moveHistoryRef.current, last ?? null);
    if (onContextUpdate) {
      onContextUpdate(context);
    }
  }, [scrambleSignal, onContextUpdate, cubiesRef, moveHistoryRef]);

  useEffect(() => {
    if (resetSignal === undefined || resetSignal === 0) return;
    const initial = generateInitialCubies();
    cubiesRef.current = initial;
    moveHistoryRef.current = [];
    springRef.current = createSpringState(0);
    const facelets = extractFacelets54(initial);
    const context = evaluateCubeState(facelets, [], null);
    if (onContextUpdate) {
      onContextUpdate(context);
    }
  }, [resetSignal, onContextUpdate, cubiesRef, moveHistoryRef, springRef]);
}

function useRubiksCubeEngine(props: RubiksCubeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cubiesRef = useRef<CubieData[]>(generateInitialCubies());
  const moveHistoryRef = useRef<string[]>([]);
  const springRef = useRef<SpringState>(createSpringState(0));
  const velocityTrackerRef = useRef(new VelocityTracker());
  const dragRef = useRef<DragState>(createEmptyDrag());
  const cameraAngleRef = useRef({ yaw: 0.78, pitch: 0.58 });
  const orbitRef = useRef<OrbitState>({
    active: false,
    startX: 0,
    startY: 0,
    startYaw: 0,
    startPitch: 0,
  });

  useCubeSignalsHandler(
    cubiesRef,
    moveHistoryRef,
    springRef,
    props.onContextUpdate,
    props.scrambleSignal,
    props.resetSignal,
  );

  useRubiksRenderLoop(
    canvasRef,
    cubiesRef,
    moveHistoryRef,
    springRef,
    dragRef,
    cameraAngleRef,
    props.onContextUpdate,
    props.autoRotateSpeed,
    orbitRef,
  );

  const pointerHandlers = useRubiksPointer(
    canvasRef,
    cubiesRef,
    springRef,
    dragRef,
    velocityTrackerRef,
    cameraAngleRef,
    orbitRef,
  );

  return { canvasRef, pointerHandlers };
}

export function RubiksCubeCanvas(props: RubiksCubeCanvasProps) {
  const { canvasRef, pointerHandlers } = useRubiksCubeEngine(props);

  return (
    <canvas
      ref={canvasRef}
      className={props.className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        cursor: "grab",
        touchAction: "none",
      }}
      tabIndex={0}
      onPointerDown={pointerHandlers.handlePointerDown}
      onPointerMove={pointerHandlers.handlePointerMove}
      onPointerUp={pointerHandlers.handlePointerUp}
      onPointerCancel={pointerHandlers.handlePointerUp}
      aria-label="3D Rubik's Cube interactive puzzle element"
    />
  );
}

export default RubiksCubeCanvas;
