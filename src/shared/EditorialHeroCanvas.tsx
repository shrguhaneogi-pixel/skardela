// ASD-STE100 Simplified Technical English comments.
// This component renders a selective WebGL procedural visual for the daily hero.
// When WebGL is unavailable or when reduced motion is preferred, it uses a clean SVG fallback.

import { useEffect, useRef, type RefObject } from "react";
import { text } from "../text/en";
import { runWebGlLoop } from "./editorial-canvas-gl";
import styles from "./EditorialHeroCanvas.module.css";

function useWebGlAnimation(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  pointerRef: RefObject<[number, number]>,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return runWebGlLoop(canvas, pointerRef);
  }, [canvasRef, pointerRef]);
}

function FallbackSvg() {
  return (
    <svg
      className={styles.fallbackSvg}
      viewBox="0 0 400 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="editorial-grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1" fill="var(--accent)" opacity="0.3" />
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#editorial-grid-pattern)" />
      <circle
        cx="200"
        cy="80"
        r="48"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.4"
      />
      <line
        x1="200"
        y1="20"
        x2="200"
        y2="140"
        stroke="var(--border)"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1="120"
        y1="80"
        x2="280"
        y2="80"
        stroke="var(--border)"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  );
}

export function EditorialHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<[number, number]>([0.5, 0.5]);
  useWebGlAnimation(canvasRef, pointerRef);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const px = (e.clientX - rect.left) / rect.width;
      const py = 1.0 - (e.clientY - rect.top) / rect.height;
      pointerRef.current = [px, py];
    }
  }

  return (
    <div
      className={styles.heroGraphicWrapper}
      onPointerMove={handlePointerMove}
      aria-label={text.home.canvasAria}
    >
      <FallbackSvg />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.overlayFrame} aria-hidden="true">
        <div className={styles.cornerMarks} />
      </div>
    </div>
  );
}
