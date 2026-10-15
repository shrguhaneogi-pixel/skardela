// ASD-STE100 Simplified Technical English comments.
// This component renders a precision crosshair reticle inspired by React Bits.
// It tracks pointer movements using requestAnimationFrame to prevent React render cycles.

import { useEffect, useRef, useState, type RefObject } from "react";
import styles from "./ReactiveCursor.module.css";

const HIDDEN_CLASS = styles.cursorHidden ?? "";
const TARGETED_CLASS = styles.reticleTargeted ?? "";

function hasFinePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(pointer: fine) and (hover: hover)").matches;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isNativeInputTarget(target: HTMLElement): boolean {
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

function isInteractiveTarget(target: HTMLElement): boolean {
  if (
    target.tagName === "BUTTON" ||
    target.tagName === "A" ||
    target.getAttribute("role") === "button"
  ) {
    return true;
  }
  if (target.closest("button") !== null || target.closest("a") !== null) {
    return true;
  }
  return target.classList.contains("square") || target.dataset.cell !== undefined;
}

function applyTransform(
  hRef: RefObject<HTMLDivElement | null>,
  vRef: RefObject<HTMLDivElement | null>,
  reticleRef: RefObject<HTMLDivElement | null>,
  x: number,
  y: number,
) {
  if (hRef.current) hRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
  if (vRef.current) vRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
  if (reticleRef.current) reticleRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function handleTargetHover(
  target: HTMLElement | null,
  containerRef: RefObject<HTMLDivElement | null>,
  reticleRef: RefObject<HTMLDivElement | null>,
) {
  if (!target) return;
  if (isNativeInputTarget(target)) {
    if (containerRef.current && HIDDEN_CLASS) {
      containerRef.current.classList.add(HIDDEN_CLASS);
    }
    return;
  }
  const interactive = isInteractiveTarget(target);
  if (reticleRef.current && TARGETED_CLASS) {
    reticleRef.current.classList.toggle(TARGETED_CLASS, interactive);
  }
}

function unbindListeners(
  onMove: (e: MouseEvent) => void,
  onOver: (e: MouseEvent) => void,
  onLeave: () => void,
  rafId: number | null,
) {
  window.removeEventListener("mousemove", onMove);
  window.removeEventListener("mouseover", onOver);
  document.removeEventListener("mouseleave", onLeave);
  window.removeEventListener("blur", onLeave);
  if (rafId !== null) cancelAnimationFrame(rafId);
}

function useCursorEffect(
  active: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
  lineHRef: RefObject<HTMLDivElement | null>,
  lineVRef: RefObject<HTMLDivElement | null>,
  reticleRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!active) return;
    let x = -100;
    let y = -100;
    let rafId: number | null = null;

    function onMove(e: MouseEvent) {
      x = e.clientX;
      y = e.clientY;
      if (containerRef.current && HIDDEN_CLASS) containerRef.current.classList.remove(HIDDEN_CLASS);
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          applyTransform(lineHRef, lineVRef, reticleRef, x, y);
          rafId = null;
        });
      }
    }

    function onOver(e: MouseEvent) {
      handleTargetHover(e.target as HTMLElement | null, containerRef, reticleRef);
    }

    function onLeave() {
      if (containerRef.current && HIDDEN_CLASS) containerRef.current.classList.add(HIDDEN_CLASS);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });
    window.addEventListener("blur", onLeave, { passive: true });

    return () => unbindListeners(onMove, onOver, onLeave, rafId);
  }, [active, containerRef, lineHRef, lineVRef, reticleRef]);
}

export function ReactiveCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineHRef = useRef<HTMLDivElement>(null);
  const lineVRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

  const [active] = useState(() => hasFinePointer() && !prefersReducedMotion());

  useCursorEffect(active, containerRef, lineHRef, lineVRef, reticleRef);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className={`${styles.cursorContainer} ${styles.cursorHidden}`}
      aria-hidden="true"
      data-testid="reactive-cursor"
    >
      <div ref={lineHRef} className={styles.lineHorizontal} />
      <div ref={lineVRef} className={styles.lineVertical} />
      <div ref={reticleRef} className={styles.reticle}>
        <div className={styles.centerDot} />
      </div>
    </div>
  );
}
