// ASD-STE100 Simplified Technical English comments.
// Hardware-accelerated Retro Arcade Screen component.
// Combines WebGL2 CRT post-processing effects with interactive 3D kinematic puzzle execution.

import { useEffect, useRef, useState } from "react";
import { text } from "../../text/en";
import { RubiksCubeCanvas } from "../rubiks-3d/RubiksCubeCanvas";
import { cleanupCrtGl, initCrtGl, renderCrtFrame, type CrtGlContext } from "./retro-crt-gl";
import styles from "./RetroArcadeScreen.module.css";

function useCrtLoop(canvasRef: React.RefObject<HTMLCanvasElement | null>, crtEnabled: boolean) {
  useEffect(() => {
    if (!crtEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CrtGlContext | null = initCrtGl(canvas);
    let animId = 0;
    const startTime = performance.now();

    const loop = (now: number) => {
      if (!ctx) return;
      renderCrtFrame(ctx, canvas, (now - startTime) * 0.001);
      animId = requestAnimationFrame(loop);
    };

    const handleLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animId);
      if (ctx) cleanupCrtGl(ctx);
      ctx = null;
    };
    const handleRestored = () => {
      ctx = initCrtGl(canvas);
      if (ctx) animId = requestAnimationFrame(loop);
    };

    canvas.addEventListener("webglcontextlost", handleLost);
    canvas.addEventListener("webglcontextrestored", handleRestored);
    if (ctx) animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", handleRestored);
      if (ctx) cleanupCrtGl(ctx);
    };
  }, [canvasRef, crtEnabled]);
}

interface ControlsProps {
  crtEnabled: boolean;
  onScramble: () => void;
  onReset: () => void;
  onToggleCrt: () => void;
}

function ArcadeControls(props: ControlsProps) {
  return (
    <div className={styles.controls}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button type="button" className={styles.arcadeButton} onClick={props.onScramble}>
          {text.cubeAgent.scramble}
        </button>
        <button type="button" className={styles.arcadeButtonSecondary} onClick={props.onReset}>
          {text.cubeAgent.reset}
        </button>
      </div>
      <button type="button" className={styles.arcadeButtonSecondary} onClick={props.onToggleCrt}>
        {props.crtEnabled ? text.arcade.disableCrt : text.arcade.enableCrt}
      </button>
    </div>
  );
}

export function RetroArcadeScreen() {
  const crtCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [scrambleSignal, setScrambleSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);

  useCrtLoop(crtCanvasRef, crtEnabled);

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
            <canvas ref={crtCanvasRef} className={styles.crtCanvas} aria-hidden="true" />
          )}
        </div>
      </div>
      <ArcadeControls
        crtEnabled={crtEnabled}
        onScramble={() => setScrambleSignal((s) => s + 1)}
        onReset={() => setResetSignal((s) => s + 1)}
        onToggleCrt={() => setCrtEnabled((prev) => !prev)}
      />
    </div>
  );
}

export default RetroArcadeScreen;
