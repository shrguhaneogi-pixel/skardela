// ASD-STE100 Simplified Technical English comments.
// Production-grade 3D Rubik's Cube Agent Interface component.
// Fully reactive, buttonless mouse kinematics, and direct LLM state synchronization.

import { type ReactNode, useCallback, useState } from "react";
import { text } from "../../text/en.ts";
import styles from "./AgentCubeInterface.module.css";
import { RubiksCubeCanvas } from "./RubiksCubeCanvas.tsx";
import {
  type CubeLLMContext,
  evaluateCubeState,
  extractFacelets54,
  generateInitialCubies,
} from "./state.ts";

export interface AgentCubeInterfaceProps {
  onStateChange?: (context: CubeLLMContext) => void;
  initialPrompt?: string;
}

function CubeHeader({ isSolved }: { isSolved: boolean }) {
  const badgeClass = `${styles.statusBadge} ${isSolved ? styles.statusSolved : styles.statusActive}`;
  const statusLabel = isSolved ? text.cubeAgent.statusSolved : text.cubeAgent.statusActive;

  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <h2 className={styles.title}>{text.cubeAgent.title}</h2>
        <p className={styles.subtitle}>{text.cubeAgent.subtitle}</p>
      </div>
      <div className={badgeClass} aria-live="polite">
        <span className={styles.statusDot} />
        {statusLabel}
      </div>
    </header>
  );
}

function CubeHud({ context }: { context: CubeLLMContext }) {
  return (
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
  );
}

function renderMoveHistoryList(history: string[]): ReactNode {
  if (history.length === 0) {
    return <span className={styles.emptyText}>{text.cubeAgent.noMoves}</span>;
  }
  const items: ReactNode[] = [];
  let step = 1;
  for (const move of history) {
    items.push(
      <li key={`history-step-${step}-${move}`} className={styles.historyBadge}>
        {move}
      </li>,
    );
    step++;
  }
  return items;
}

interface ActionButtonsProps {
  copied: boolean;
  onCopyPrompt: () => void;
  onScramble: () => void;
  onReset: () => void;
}

function CubeActionButtons({ copied, onCopyPrompt, onScramble, onReset }: ActionButtonsProps) {
  return (
    <div className={styles.actionRow}>
      <button type="button" className={styles.buttonPrimary} onClick={onCopyPrompt}>
        {copied ? text.cubeAgent.copied : text.cubeAgent.copyContext}
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <button type="button" className={styles.buttonSecondary} onClick={onScramble}>
          {text.cubeAgent.scramble}
        </button>
        <button type="button" className={styles.buttonSecondary} onClick={onReset}>
          {text.cubeAgent.reset}
        </button>
      </div>
    </div>
  );
}

interface CubeSidebarProps {
  context: CubeLLMContext;
  copied: boolean;
  onCopyPrompt: () => void;
  onScramble: () => void;
  onReset: () => void;
}

function CubeSidebar({ context, copied, onCopyPrompt, onScramble, onReset }: CubeSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{text.cubeAgent.llmContextPayload}</h3>
        <button
          type="button"
          className={styles.promptCard}
          title={text.cubeAgent.copyHelp}
          onClick={onCopyPrompt}
        >
          {context.llmPromptSnippet}
        </button>
        <p className={styles.instructions}>
          {copied ? text.cubeAgent.copied : text.cubeAgent.copyHelp}
        </p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{text.cubeAgent.moveLedger}</h3>
        <ul className={styles.historyList} aria-label={text.cubeAgent.moveLedger}>
          {renderMoveHistoryList(context.moveHistory)}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{text.cubeAgent.spatialControls}</h3>
        <p className={styles.instructions}>{text.cubeAgent.instructions}</p>
        <p className={styles.instructions}>{text.cubeAgent.cameraInstructions}</p>
      </section>

      <CubeActionButtons
        copied={copied}
        onCopyPrompt={onCopyPrompt}
        onScramble={onScramble}
        onReset={onReset}
      />
    </aside>
  );
}

function useCubeSignals() {
  const [copied, setCopied] = useState(false);
  const [scrambleSignal, setScrambleSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);

  const copyPrompt = useCallback((snippet: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const triggerScramble = useCallback(() => setScrambleSignal((s) => s + 1), []);
  const triggerReset = useCallback(() => setResetSignal((s) => s + 1), []);

  return { copied, scrambleSignal, resetSignal, copyPrompt, triggerScramble, triggerReset };
}

function useCubeContext(onStateChange?: (context: CubeLLMContext) => void) {
  const [context, setContext] = useState<CubeLLMContext>(() => {
    const initialCubies = generateInitialCubies();
    const facelets = extractFacelets54(initialCubies);
    return evaluateCubeState(facelets);
  });

  const handleContextUpdate = useCallback(
    (newContext: CubeLLMContext) => {
      setContext(newContext);
      if (onStateChange) {
        onStateChange(newContext);
      }
    },
    [onStateChange],
  );

  return { context, handleContextUpdate };
}

export function AgentCubeInterface({ onStateChange }: AgentCubeInterfaceProps) {
  const { context, handleContextUpdate } = useCubeContext(onStateChange);
  const { copied, scrambleSignal, resetSignal, copyPrompt, triggerScramble, triggerReset } =
    useCubeSignals();

  const handleCopy = useCallback(() => {
    copyPrompt(context.llmPromptSnippet);
  }, [context.llmPromptSnippet, copyPrompt]);

  return (
    <section className={styles.container} aria-label={text.cubeAgent.title}>
      <CubeHeader isSolved={context.isSolved} />
      <div className={styles.mainStage}>
        <div className={styles.viewportContainer}>
          <RubiksCubeCanvas
            onContextUpdate={handleContextUpdate}
            scrambleSignal={scrambleSignal}
            resetSignal={resetSignal}
          />
          <CubeHud context={context} />
        </div>
        <CubeSidebar
          context={context}
          copied={copied}
          onCopyPrompt={handleCopy}
          onScramble={triggerScramble}
          onReset={triggerReset}
        />
      </div>
      <div className={styles.srOnly} aria-live="polite">
        {context.lastMove ? text.cubeAgent.moveAnnounce(context.lastMove, context.moveCount) : ""}
      </div>
    </section>
  );
}

export default AgentCubeInterface;
