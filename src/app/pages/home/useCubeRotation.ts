import { useRef, useState } from "react";
import type { PuzzleType } from "../../puzzle-types/registry";
import { cubeFaces, fallbackFace } from "./cube-faces";
import { INITIAL_ROT_X, INITIAL_ROT_Y, normalizeTargetAngle } from "./cube-math";
import { useCubePointer } from "./useCubePointer";

// Manages 3D rotation, face selection, shortest angular paths and pointer drag.
export function useCubeRotation(onSelectPuzzle?: (type: PuzzleType) => void) {
  const [activeType, setActiveType] = useState<PuzzleType>("latics");
  const cubeRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef({ x: INITIAL_ROT_X, y: INITIAL_ROT_Y });

  const selectFace = (type: PuzzleType) => {
    const face = cubeFaces.find((f) => f.type === type) ?? fallbackFace;
    setActiveType(type);
    onSelectPuzzle?.(type);

    const targetX = face.viewX;
    const targetY = normalizeTargetAngle(rotRef.current.y, face.viewY);
    rotRef.current = { x: targetX, y: targetY };
    if (cubeRef.current !== null) {
      cubeRef.current.style.transform = `rotateX(${targetX}deg) rotateY(${targetY}deg)`;
    }
  };

  const { handlePointerDown, handlePointerMove, handlePointerUp, handleLostPointerCapture } =
    useCubePointer(cubeRef, rotRef, selectFace);

  return {
    activeType,
    cubeRef,
    selectFace,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleLostPointerCapture,
  };
}
