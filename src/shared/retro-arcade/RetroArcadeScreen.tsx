// ASD-STE100 Simplified Technical English comments.
// Hardware-accelerated Retro Arcade Screen component.
// Combines WebGL2 CRT post-processing effects with interactive 3D kinematic puzzle execution.

import { useEffect, useRef, useState } from "react";
import { text } from "../../text/en";
import { RubiksCubeCanvas } from "../rubiks-3d/RubiksCubeCanvas";
import { cleanupCrtGl, initCrtGl, renderCrtFrame, type CrtGlContext } from "./retro-crt-gl";
import styles from "./RetroArcadeScreen.module.css";

export function RetroArcadeScreen() {
  const crtCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [scrambleSignal, setScrambleSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    if (!crtEnabled) return;
    const canvas = crtCanvasRef.current;
    if (!canvas) return;

    let ctx: CrtGlContext | null = initCrtGl(canvas);
    let animId = 0;
    const startTime = performance.now();

    const loop = (now: number) => {
      if (ctx) {
        renderCrtFrame(ctx, canvas, (now - startTime) * 0.001);
      }
      animId = requestAnimationFrame(loop);
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animId);
      if (ctx) {
        cleanupCrtGl(ctx);
        ctx = null;
      }
    };

    const handleContextRestored = () => {
      ctx = initCrtGl(canvas);
      animId = requestAnimationFrame(loop);
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      if (ctx) {
        cleanupCrtGl(ctx);
      }
    };
  }, [crtEnabled]);

  return (
    <div className={styles.arcadeContainer}>
      <div className={styles.cabinetFrame}>
        <div className={styles.crtBezel}>
          <div className={styles.interactiveStage}>
            <RubiksCubeCanvas
              scrambleSignal={scrambleSignal}
              resetSignal={resetSignal}
              autoRotateSpeed={0.2}
            />
          </div>
          {crtEnabled && (
            <canvas
              ref={crtCanvasRef}
              className={styles.crtCanvas}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className={styles.arcadeButton}
            onClick={() => setScrambleSignal((s) => s + 1)}
          >
            {text.cubeAgent.scramble}
          </button>
          <button
            type="button"
            className={styles.arcadeButtonSecondary}
            onClick={() => setResetSignal((s) => s + 1)}
          >
            {text.cubeAgent.reset}
          </button>
        </div>

        <button
          type="button"
          className={styles.arcadeButtonSecondary}
          onClick={() => setCrtEnabled((prev) => !prev)}
        >
          {crtEnabled ? "Disable CRT Shader" : "Enable CRT Shader"}
        </button>
      </div>
    </div>
  );
}

export default RetroArcadeScreen;
