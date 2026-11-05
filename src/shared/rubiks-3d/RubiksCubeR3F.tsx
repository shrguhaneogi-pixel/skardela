// ASD-STE100 Simplified Technical English comments.
// 3D Rubik's Cube component implementation for Skardela.
// Uses the standalone WebGL2 canvas for browser execution with zero external dependencies.

import { RubiksCubeCanvas } from "./RubiksCubeCanvas.tsx";
import type { CubeLLMContext } from "./state.ts";

export interface RubiksCubeR3FProps {
  onContextUpdate?: (context: CubeLLMContext) => void;
  scrambleMoves?: string[];
  autoRotate?: boolean;
}

export default function RubiksCubeR3F({ onContextUpdate, autoRotate = false }: RubiksCubeR3FProps) {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: "480px", position: "relative" }}>
      <RubiksCubeCanvas onContextUpdate={onContextUpdate} autoRotateSpeed={autoRotate ? 0.3 : 0} />
    </div>
  );
}
