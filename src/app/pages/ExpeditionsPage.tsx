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
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import { ExpeditionRouteMap } from "../../shared/ExpeditionRouteMap";
import styles from "./ExpeditionsPage.module.css";

function ExpeditionsHeader() {
  return (
    <section className={styles.hero}>
      <h1>
        <span aria-hidden="true">{symbols.expeditions.compass} </span>
        {text.expeditions.title}
      </h1>
      <p className={styles.intro}>{text.expeditions.intro}</p>
      <div className={styles.disclaimer} role="note">
        {text.expeditions.disclaimer}
      </div>
    </section>
  );
}

function StageBadge({ status }: { readonly status: StageState }) {
  if (status === "completed") {
    return (
      <span className={styles.badgeCompleted}>
        {symbols.expeditions.completed} {text.expeditions.stageCompleted}
      </span>
    );
  }
  if (status === "available") {
    return <span className={styles.badgeAvailable}>{text.expeditions.stageAvailable}</span>;
  }
  return (
    <span className={styles.badgeLocked}>
      {symbols.expeditions.locked} {text.expeditions.stageLocked}
    </span>
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
          <Link to={`/puzzles/${stage.puzzleId}`} className={styles.playBtn}>
            {btnLabel}
          </Link>
        )}
      </div>
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
    <section className={styles.chapterCard} aria-labelledby={`chap-${chapter.id}`}>
      <div className={styles.chapterHeader}>
        <span className={styles.seasonBadge}>{chapter.season}</span>
        <h2 id={`chap-${chapter.id}`} className={styles.chapterTitle}>
          {chapter.title}
        </h2>
        <p className={styles.chapterDescription}>{chapter.description}</p>
        <div className={styles.progressContainer}>
          <progress
            className={styles.progressBar}
            value={progress.percentage}
            max={100}
            aria-label={text.expeditions.chapterProgress(
              progress.completedCount,
              progress.totalCount,
              progress.percentage,
            )}
          />
          <span className={styles.progressLabel}>
            {text.expeditions.chapterProgress(
              progress.completedCount,
              progress.totalCount,
              progress.percentage,
            )}
          </span>
        </div>
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
