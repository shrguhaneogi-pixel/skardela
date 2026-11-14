import { useRef, type PointerEvent, type RefObject } from "react";
import type { PuzzleType } from "../../puzzle-types/registry";
import { getNearestFace } from "./cube-math";

type DragState = {
  isDragging: boolean;
  hasMoved: boolean;
  targetFace?: PuzzleType;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  velocityX: number;
  velocityY: number;
  startRotX: number;
  startRotY: number;
};

const initialDragState = (): DragState => ({
  isDragging: false,
  hasMoved: false,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  lastTime: 0,
  velocityX: 0,
  velocityY: 0,
  startRotX: 0,
  startRotY: 0,
});

function setPointerCaptureSafe(target: HTMLDivElement, pointerId: number) {
  if (typeof target.setPointerCapture === "function") {
    target.setPointerCapture(pointerId);
  }
}

function releasePointerCaptureSafe(target: HTMLDivElement, pointerId: number) {
  if (
    typeof target.hasPointerCapture === "function" &&
    target.hasPointerCapture(pointerId) &&
    typeof target.releasePointerCapture === "function"
  ) {
    target.releasePointerCapture(pointerId);
  }
}

function updateDragVelocity(drag: DragState, clientX: number, clientY: number, now: number) {
  const dt = Math.max(1, now - drag.lastTime);
  drag.velocityX = (clientX - drag.lastX) / dt;
  drag.velocityY = (clientY - drag.lastY) / dt;
  drag.lastX = clientX;
  drag.lastY = clientY;
  drag.lastTime = now;
}

function applyPointerMove(
  drag: DragState,
  cube: HTMLDivElement | null,
  rotRef: RefObject<{ x: number; y: number }>,
  clientX: number,
  clientY: number,
) {
  const dx = clientX - drag.startX;
  const dy = clientY - drag.startY;
  if (!drag.hasMoved && Math.hypot(dx, dy) > 4) drag.hasMoved = true;
  updateDragVelocity(drag, clientX, clientY, performance.now());

  const newRotY = drag.startRotY + dx * 0.45;
  const newRotX = Math.max(-75, Math.min(75, drag.startRotX - dy * 0.45));
  rotRef.current = { x: newRotX, y: newRotY };
  if (cube !== null) {
    cube.style.transform = `rotateX(${newRotX}deg) rotateY(${newRotY}deg)`;
  }
}

function computeSnapFace(drag: DragState, rotX: number, rotY: number): PuzzleType {
  const vx = Math.max(-1.5, Math.min(1.5, drag.velocityX));
  const vy = Math.max(-1.5, Math.min(1.5, drag.velocityY));
  const projectedX = Math.max(-75, Math.min(75, rotX - vy * 40));
  const projectedY = rotY + vx * 40;
  return getNearestFace(projectedX, projectedY);
}

// Handles pointer drag and tap interactions on the 3D sculpture.
export function useCubePointer(
  cubeRef: RefObject<HTMLDivElement | null>,
  rotRef: RefObject<{ x: number; y: number }>,
  onFaceSelect: (type: PuzzleType) => void,
) {
  const dragRef = useRef<DragState>(initialDragState());

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setPointerCaptureSafe(e.currentTarget, e.pointerId);
    const faceEl = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-face-type]");
    dragRef.current = {
      ...initialDragState(),
      isDragging: true,
      targetFace: faceEl?.dataset.faceType as PuzzleType | undefined,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      lastTime: performance.now(),
      startRotX: rotRef.current.x,
      startRotY: rotRef.current.y,
    };
    if (cubeRef.current !== null) cubeRef.current.dataset.dragging = "true";
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    applyPointerMove(dragRef.current, cubeRef.current, rotRef, e.clientX, e.clientY);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    releasePointerCaptureSafe(e.currentTarget, e.pointerId);
    dragRef.current.isDragging = false;
    if (cubeRef.current !== null) delete cubeRef.current.dataset.dragging;

    if (!dragRef.current.hasMoved && dragRef.current.targetFace) {
      onFaceSelect(dragRef.current.targetFace);
      return;
    }
    onFaceSelect(computeSnapFace(dragRef.current, rotRef.current.x, rotRef.current.y));
  };

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
