// Puzzle Seasons and Themed Expeditions page.
// Follows ASD-STE100 Simplified Technical English.

import { useState } from "react";
import { Link } from "react-router";
import {
  DEFAULT_EXPEDITIONS,
  getChapterProgress,
  type ExpeditionChapter,
  type ExpeditionStage,
  type StageState,
} from "../../shared/expeditions";
import { getAllProgressRecords } from "../../shared/puzzle-progress";
import { Badge } from "../../shared/ui/Badge";
import { buttonVariants } from "../../shared/ui/button-variants";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import { ExpeditionRouteMap } from "../../shared/ExpeditionRouteMap";
import styles from "./ExpeditionsPage.module.css";

function ExpeditionsHeader() {
  return (
    <section className="sk-hero">
      <h1>
        <span aria-hidden="true">{symbols.expeditions.compass} </span>
        {text.expeditions.title}
      </h1>
      <p className="sk-intro">{text.expeditions.intro}</p>
      <div className="sk-disclaimer" role="note">
        {text.expeditions.disclaimer}
      </div>
    </section>
  );
}

function StageBadge({ status }: { readonly status: StageState }) {
  if (status === "completed") {
    return (
      <Badge variant="success">
        {symbols.expeditions.completed} {text.expeditions.stageCompleted}
      </Badge>
    );
  }
  if (status === "available") {
    return <Badge variant="muted">{text.expeditions.stageAvailable}</Badge>;
  }
  return (
    <Badge variant="muted">
      {symbols.expeditions.locked} {text.expeditions.stageLocked}
    </Badge>
  );
}

function StageCard({
  stage,
  status,
}: {
  readonly stage: ExpeditionStage;
  readonly status: StageState;
}) {
  const isLocked = status === "locked";
  const btnLabel =
    status === "completed" ? text.expeditions.reviewStageBtn : text.expeditions.playStageBtn;

  return (
    <div className={styles.stageCard}>
      <div className={styles.stageInfo}>
        <span className={styles.stageTitle}>{stage.title}</span>
        <StageBadge status={status} />
      </div>
      <div>
        {isLocked ? (
          <span className={styles.playBtnDisabled} aria-disabled="true">
            {text.expeditions.playStageBtn}
          </span>
        ) : (
          <Link
            to={`/puzzles/${stage.puzzleId}`}
            className={buttonVariants({ variant: "primary", size: "sm" })}
            viewTransition
          >
            {btnLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

function ChapterProgress({
  progress,
}: {
  readonly progress: ReturnType<typeof getChapterProgress>;
}) {
  const label = text.expeditions.chapterProgress(
    progress.completedCount,
    progress.totalCount,
    progress.percentage,
  );
  return (
    <div className={styles.progressContainer}>
      <progress className="sk-progress" value={progress.percentage} max={100} aria-label={label} />
      <span className={styles.progressLabel}>{label}</span>
    </div>
  );
}

function ChapterCard({
  chapter,
  solvedIds,
}: {
  readonly chapter: ExpeditionChapter;
  readonly solvedIds: ReadonlySet<string>;
}) {
  const progress = getChapterProgress(chapter, solvedIds);
  const statusMap = new Map(progress.stages.map((s) => [s.stageId, s.status]));

  return (
    <section
      className={`sk-surface-card sk-surface-card-interactive ${styles.chapterCard}`}
      aria-labelledby={`chap-${chapter.id}`}
    >
      <div className={styles.chapterHeader}>
        <span className="sk-eyebrow">{chapter.season}</span>
        <h2 id={`chap-${chapter.id}`} className={styles.chapterTitle}>
          {chapter.title}
        </h2>
        <p className={styles.chapterDescription}>{chapter.description}</p>
        <ChapterProgress progress={progress} />
      </div>

      <ExpeditionRouteMap stages={chapter.stages} statusMap={statusMap} />

      <div className={styles.stagesList}>
        {chapter.stages.map((stage) => (
          <StageCard key={stage.id} stage={stage} status={statusMap.get(stage.id) ?? "locked"} />
        ))}
      </div>
    </section>
  );
}

export function ExpeditionsPage() {
  const [solvedIds] = useState<Set<string>>(() => {
    const records = getAllProgressRecords();
    return new Set(records.filter((r) => r.isSolved).map((r) => r.puzzleId));
  });

  return (
    <div>
      <ExpeditionsHeader />
      <div className={styles.chapterList}>
        {DEFAULT_EXPEDITIONS.chapters.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} solvedIds={solvedIds} />
        ))}
      </div>
    </div>
  );
}
