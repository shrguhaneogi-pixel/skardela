// ASD-STE100 Simplified Technical English comments.
// Mouse and touch pointer event handlers for spatial cube kinematics and camera orbit.

import { useCallback } from "react";
import { dotVec2, type Vec2 } from "./math.ts";
import { computeCameraEye, pickCubie } from "./rubiks-raycast.ts";
import { createEmptyDrag, type DragState, updateKinematicsDrag } from "./rubiks-renderer.ts";
import {
  computeSnapAngle,
  DEFAULT_SPRING_CONFIG,
  type SpringState,
  type VelocityTracker,
} from "./spring.ts";
import type { CubieData } from "./state.ts";

export interface OrbitState {
  active: boolean;
  startX: number;
  startY: number;
  startYaw: number;
  startPitch: number;
}

function processOrbitMove(
  orbit: OrbitState,
  clientX: number,
  clientY: number,
  cameraAngle: { yaw: number; pitch: number },
) {
  const dx = clientX - orbit.startX;
  const dy = clientY - orbit.startY;
  cameraAngle.yaw = orbit.startYaw - dx * 0.007;
  cameraAngle.pitch = Math.max(-1.35, Math.min(1.35, orbit.startPitch + dy * 0.007));
}

function processKinematicsMove(
  drag: DragState,
  deltaX: number,
  deltaY: number,
  cameraAngle: { yaw: number; pitch: number },
  canvas: HTMLCanvasElement,
  cubies: CubieData[],
  velocityTracker: VelocityTracker,
  springRef: React.RefObject<SpringState>,
) {
  if (!drag.isLocked && Math.hypot(deltaX, deltaY) >= 8) {
    updateKinematicsDrag(
      drag,
      deltaX,
      deltaY,
      cameraAngle.yaw,
      cameraAngle.pitch,
      canvas.clientWidth,
      canvas.clientHeight,
      cubies,
    );
  }
  if (drag.isLocked && drag.rotationAxis && drag.screenTangent) {
    const dragVector: Vec2 = { x: deltaX, y: deltaY };
    const angle = dotVec2(dragVector, drag.screenTangent) * 0.008;
    velocityTracker.update(angle, performance.now());
    springRef.current = { position: angle, velocity: 0, target: angle, isSettled: true };
  }
}

function onPointerDownEvent(
  e: React.PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement | null,
  spring: SpringState,
  cubies: CubieData[],
  cameraAngle: { yaw: number; pitch: number },
  dragRef: React.RefObject<DragState>,
  orbitRef: React.RefObject<OrbitState>,
  velocityTracker: VelocityTracker,
) {
  if (!canvas || !spring.isSettled) return;
  const rect = canvas.getBoundingClientRect();
  const eye = computeCameraEye(cameraAngle.yaw, cameraAngle.pitch);
  const hit = pickCubie(
    e.clientX - rect.left,
    e.clientY - rect.top,
    canvas.clientWidth,
    canvas.clientHeight,
    eye,
    cubies,
  );
  if (typeof canvas.setPointerCapture === "function") {
    canvas.setPointerCapture(e.pointerId);
  }

  if (hit) {
    dragRef.current = {
      active: true,
      isLocked: false,
      startScreen: { x: e.clientX, y: e.clientY },
      hitPoint: hit.hitPoint,
      normal: hit.normal,
      clickedCubieIndex: hit.cubieIndex,
      rotationAxis: null,
      screenTangent: null,
      sliceIndices: [],
    };
    velocityTracker.reset(0, performance.now());
  } else {
    orbitRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startYaw: cameraAngle.yaw,
      startPitch: cameraAngle.pitch,
    };
  }
}

function onPointerUpEvent(
  e: React.PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement | null,
  dragRef: React.RefObject<DragState>,
  orbitRef: React.RefObject<OrbitState>,
  springRef: React.RefObject<SpringState>,
  velocityTracker: VelocityTracker,
) {
  if (typeof canvas?.hasPointerCapture === "function" && canvas.hasPointerCapture(e.pointerId)) {
    canvas.releasePointerCapture(e.pointerId);
  }
  if (orbitRef.current.active) {
    orbitRef.current.active = false;
    return;
  }
  const drag = dragRef.current;
  if (!drag.active) return;
  drag.active = false;
  if (!drag.isLocked || !drag.rotationAxis) {
    dragRef.current = createEmptyDrag();
    return;
  }
  const currentAngle = springRef.current.position;
  const releaseVelocity = velocityTracker.getVelocity();
  const snapTarget = computeSnapAngle(currentAngle, releaseVelocity, DEFAULT_SPRING_CONFIG);
  springRef.current = {
    position: currentAngle,
    velocity: releaseVelocity,
    target: snapTarget,
    isSettled: false,
  };
}

function usePointerDownCallback(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cubiesRef: React.RefObject<CubieData[]>,
  springRef: React.RefObject<SpringState>,
  dragRef: React.RefObject<DragState>,
  velocityTrackerRef: React.RefObject<VelocityTracker>,
  cameraAngleRef: React.RefObject<{ yaw: number; pitch: number }>,
  orbitRef: React.RefObject<OrbitState>,
) {
  return useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      onPointerDownEvent(
        e,
        canvasRef.current,
        springRef.current,
        cubiesRef.current,
        cameraAngleRef.current,
        dragRef,
        orbitRef,
        velocityTrackerRef.current,
      );
    },
    [canvasRef, cubiesRef, springRef, dragRef, velocityTrackerRef, cameraAngleRef, orbitRef],
  );
}

function usePointerMoveCallback(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cubiesRef: React.RefObject<CubieData[]>,
  dragRef: React.RefObject<DragState>,
  velocityTrackerRef: React.RefObject<VelocityTracker>,
  cameraAngleRef: React.RefObject<{ yaw: number; pitch: number }>,
  orbitRef: React.RefObject<OrbitState>,
  springRef: React.RefObject<SpringState>,
) {
  return useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (orbitRef.current.active) {
        processOrbitMove(orbitRef.current, e.clientX, e.clientY, cameraAngleRef.current);
      } else if (dragRef.current.active && canvasRef.current) {
        const deltaX = e.clientX - dragRef.current.startScreen.x;
        const deltaY = e.clientY - dragRef.current.startScreen.y;
        processKinematicsMove(
          dragRef.current,
          deltaX,
          deltaY,
          cameraAngleRef.current,
          canvasRef.current,
          cubiesRef.current,
          velocityTrackerRef.current,
          springRef,
        );
      }
    },
    [canvasRef, cubiesRef, dragRef, velocityTrackerRef, cameraAngleRef, orbitRef, springRef],
  );
}

function usePointerUpCallback(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  dragRef: React.RefObject<DragState>,
  orbitRef: React.RefObject<OrbitState>,
  springRef: React.RefObject<SpringState>,
  velocityTrackerRef: React.RefObject<VelocityTracker>,
) {
  return useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      onPointerUpEvent(
        e,
        canvasRef.current,
        dragRef,
        orbitRef,
        springRef,
        velocityTrackerRef.current,
      );
    },
    [canvasRef, dragRef, orbitRef, springRef, velocityTrackerRef],
  );
}

export function useRubiksPointer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cubiesRef: React.RefObject<CubieData[]>,
  springRef: React.RefObject<SpringState>,
  dragRef: React.RefObject<DragState>,
  velocityTrackerRef: React.RefObject<VelocityTracker>,
  cameraAngleRef: React.RefObject<{ yaw: number; pitch: number }>,
  orbitRef: React.RefObject<OrbitState>,
) {
  const handlePointerDown = usePointerDownCallback(
    canvasRef,
    cubiesRef,
    springRef,
    dragRef,
    velocityTrackerRef,
    cameraAngleRef,
    orbitRef,
  );
  const handlePointerMove = usePointerMoveCallback(
    canvasRef,
    cubiesRef,
    dragRef,
    velocityTrackerRef,
    cameraAngleRef,
    orbitRef,
    springRef,
  );
  const handlePointerUp = usePointerUpCallback(
    canvasRef,
    dragRef,
    orbitRef,
    springRef,
    velocityTrackerRef,
  );

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
