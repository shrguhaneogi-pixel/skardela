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

function isNativeInputTarget(target: Element | null): boolean {
  if (!target) return false;
  const tagName = target.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }
  if ((target as HTMLElement).isContentEditable) {
    return true;
  }
  return target.closest("input, textarea, select, [contenteditable='true']") !== null;
}

function isInteractiveTarget(target: Element | null): boolean {
  if (!target) return false;
  const tagName = target.tagName;
  if (
    tagName === "BUTTON" ||
    tagName === "A" ||
    target.getAttribute("role") === "button" ||
    target.getAttribute("role") === "link"
  ) {
    return true;
  }
  return target.closest("button, a, [role='button'], [role='link'], summary") !== null;
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

function updateCursorState(
  target: Element | null,
  containerRef: RefObject<HTMLDivElement | null>,
  reticleRef: RefObject<HTMLDivElement | null>,
) {
  if (!containerRef.current) return;
  const isInput = isNativeInputTarget(target);
  if (isInput) {
    if (HIDDEN_CLASS) {
      containerRef.current.classList.add(HIDDEN_CLASS);
    }
    return;
  }
  if (HIDDEN_CLASS) {
    containerRef.current.classList.remove(HIDDEN_CLASS);
  }
  const interactive = isInteractiveTarget(target);
  if (reticleRef.current && TARGETED_CLASS) {
    reticleRef.current.classList.toggle(TARGETED_CLASS, interactive);
  }
}

function syncCursorAttribute(active: boolean) {
  if (typeof document === "undefined") return;
  if (active) {
    document.documentElement.dataset.customCursor = "active";
  } else {
    delete document.documentElement.dataset.customCursor;
  }
}

function bindCursorListeners(
  onMove: (e: MouseEvent) => void,
  onOver: (e: MouseEvent) => void,
  onLeave: () => void,
  onVisibilityChange: () => void,
) {
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseover", onOver, { passive: true });
  document.addEventListener("mouseleave", onLeave, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange, { passive: true });
  window.addEventListener("blur", onLeave, { passive: true });
}

function unbindListeners(
  onMove: (e: MouseEvent) => void,
  onOver: (e: MouseEvent) => void,
  onLeave: () => void,
  onVisibilityChange: () => void,
  rafId: number | null,
) {
  window.removeEventListener("mousemove", onMove);
  window.removeEventListener("mouseover", onOver);
  document.removeEventListener("mouseleave", onLeave);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  window.removeEventListener("blur", onLeave);
  if (rafId !== null) cancelAnimationFrame(rafId);
  syncCursorAttribute(false);
}

function useCursorEffect(
  active: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
  lineHRef: RefObject<HTMLDivElement | null>,
  lineVRef: RefObject<HTMLDivElement | null>,
  reticleRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    syncCursorAttribute(active);
    if (!active) return;

    let x = -100;
    let y = -100;
    let rafId: number | null = null;

    function onMove(e: MouseEvent) {
      x = e.clientX;
      y = e.clientY;
      updateCursorState(e.target as Element | null, containerRef, reticleRef);
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          applyTransform(lineHRef, lineVRef, reticleRef, x, y);
          rafId = null;
        });
      }
    }

    function onOver(e: MouseEvent) {
      updateCursorState(e.target as Element | null, containerRef, reticleRef);
    }

    function onLeave() {
      if (containerRef.current && HIDDEN_CLASS) {
        containerRef.current.classList.add(HIDDEN_CLASS);
      }
    }

    function onVisibilityChange() {
      if (document.hidden) onLeave();
    }

    bindCursorListeners(onMove, onOver, onLeave, onVisibilityChange);
    return () => unbindListeners(onMove, onOver, onLeave, onVisibilityChange, rafId);
  }, [active, containerRef, lineHRef, lineVRef, reticleRef]);
}

export function ReactiveCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineHRef = useRef<HTMLDivElement>(null);
  const lineVRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(() => hasFinePointer() && !prefersReducedMotion());

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const finePointerQuery = window.matchMedia("(pointer: fine) and (hover: hover)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function updateActiveState() {
      setActive(finePointerQuery.matches && !motionQuery.matches);
    }

    finePointerQuery.addEventListener("change", updateActiveState);
    motionQuery.addEventListener("change", updateActiveState);

    return () => {
      finePointerQuery.removeEventListener("change", updateActiveState);
      motionQuery.removeEventListener("change", updateActiveState);
    };
  }, []);

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
