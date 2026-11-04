// ASD-STE100 Simplified Technical English comments.
// Production-grade 3D Rubik's Cube Agent Interface component.
// Fully reactive, buttonless mouse kinematics, and direct LLM state synchronization.

"use client";

import React, { useState, useCallback } from "react";
import { RubiksCubeCanvas } from "./RubiksCubeCanvas.tsx";
import {
  evaluateCubeState,
  extractFacelets54,
  generateInitialCubies,
  type CubeLLMContext,
} from "./state.ts";
import { text } from "../../text/en.ts";
import styles from "./AgentCubeInterface.module.css";

export interface AgentCubeInterfaceProps {
  onStateChange?: (context: CubeLLMContext) => void;
  initialPrompt?: string;
}

export function AgentCubeInterface({
  onStateChange,
}: AgentCubeInterfaceProps) {
  const [context, setContext] = useState<CubeLLMContext>(() => {
    const initialCubies = generateInitialCubies();
    const facelets = extractFacelets54(initialCubies);
    return evaluateCubeState(facelets);
  });

  const [copied, setCopied] = useState(false);
  const [scrambleSignal, setScrambleSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);

  // Sync state changes with parent listener.
  const handleContextUpdate = useCallback(
    (newContext: CubeLLMContext) => {
      setContext(newContext);
      if (onStateChange) {
        onStateChange(newContext);
      }
    },
    [onStateChange],
  );

  const handleCopyPrompt = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(context.llmPromptSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [context.llmPromptSnippet]);

  const handleScramble = useCallback(() => {
    setScrambleSignal((s) => s + 1);
  }, []);

  const handleReset = useCallback(() => {
    setResetSignal((s) => s + 1);
  }, []);

  return (
    <div className={styles.container} role="region" aria-label={text.cubeAgent.title}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>{text.cubeAgent.title}</h2>
          <p className={styles.subtitle}>{text.cubeAgent.subtitle}</p>
        </div>
        <div
          className={`${styles.statusBadge} ${context.isSolved ? styles.statusSolved : styles.statusActive}`}
          aria-live="polite"
        >
          <span className={styles.statusDot} />
          {context.isSolved ? text.cubeAgent.statusSolved : text.cubeAgent.statusActive}
        </div>
      </header>

      <div className={styles.mainStage}>
        <div className={styles.viewportContainer}>
          <RubiksCubeCanvas
            onContextUpdate={handleContextUpdate}
            scrambleSignal={scrambleSignal}
            resetSignal={resetSignal}
          />

          <div className={styles.hudOverlay} aria-hidden="true">
            <div className={styles.hudChip}>
              <span className={styles.hudLabel}>{text.cubeAgent.moves}</span>
              <span className={styles.hudValue}>{context.moveCount}</span>
            </div>
            <div className={styles.hudChip}>
              <span className={styles.hudLabel}>{text.cubeAgent.entropy}</span>
              <span className={styles.hudValue}>{context.entropy}</span>
            </div>
            {context.lastMove && (
              <div className={styles.hudChip}>
                <span className={styles.hudLabel}>{text.cubeAgent.lastMove}</span>
                <span className={styles.hudValue}>{context.lastMove}</span>
              </div>
            )}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{text.cubeAgent.llmContextPayload}</h3>
            <div
              className={styles.promptCard}
              title={text.cubeAgent.copyHelp}
              onClick={handleCopyPrompt}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleCopyPrompt()}
            >
              {context.llmPromptSnippet}
            </div>
            <p className={styles.instructions}>
              {copied ? text.cubeAgent.copied : text.cubeAgent.copyHelp}
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{text.cubeAgent.moveLedger}</h3>
            <div className={styles.historyList} role="list" aria-label={text.cubeAgent.moveLedger}>
              {context.moveHistory.length === 0 ? (
                <span className={styles.emptyText}>{text.cubeAgent.noMoves}</span>
              ) : (
                context.moveHistory.map((m, idx) => (
                  <span key={idx} className={styles.historyBadge} role="listitem">
                    {m}
                  </span>
                ))
              )}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>{text.cubeAgent.spatialControls}</h3>
            <p className={styles.instructions}>{text.cubeAgent.instructions}</p>
            <p className={styles.instructions}>{text.cubeAgent.cameraInstructions}</p>
          </section>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={handleCopyPrompt}
            >
              {copied ? text.cubeAgent.copied : text.cubeAgent.copyContext}
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={handleScramble}
              >
                {text.cubeAgent.scramble}
              </button>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={handleReset}
              >
                {text.cubeAgent.reset}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className={styles.srOnly} aria-live="polite">
        {context.lastMove ? `Moved slice ${context.lastMove}. Current move count: ${context.moveCount}.` : ""}
      </div>
    </div>
  );
}

export default AgentCubeInterface;
