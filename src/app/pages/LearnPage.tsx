// Logic Learning Pathways page.
// Follows ASD-STE100 Simplified Technical English.

import { useState } from "react";
import { Link } from "react-router";
import {
  PATHWAYS,
  loadCompletedLessons,
  markLessonCompleted,
  type Lesson,
  type Pathway,
  type WorkedExampleStep,
} from "../../shared/learning-pathways";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import styles from "./LearnPage.module.css";

function LearnHeader() {
  return (
    <section className={styles.hero}>
      <h1>
        <span aria-hidden="true">{symbols.learn.pathway} </span>
        {text.learn.title}
      </h1>
      <p className={styles.intro}>{text.learn.intro}</p>
      <div className={styles.disclaimer} role="note">
        {text.learn.disclaimer}
      </div>
    </section>
  );
}

function WorkedExampleView({ steps }: { readonly steps: readonly WorkedExampleStep[] }) {
  return (
    <div className={styles.sectionBlock}>
      <span className={styles.sectionLabel}>{text.learn.workedExampleHeading}</span>
      <div className={styles.workedExampleBox}>
        {steps.map((step, idx) => (
          <div key={step.title} className={styles.exampleStep}>
            <span className={styles.stepTitle}>
              {symbols.learn.step} Step {idx + 1}: {step.title}
            </span>
            <span className={styles.stepExplanation}>{step.explanation}</span>
            <ul className={styles.cuesList}>
              {step.visualCues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LessonCardProps {
  readonly lesson: Lesson;
  readonly isDone: boolean;
  readonly onMarkDone: (id: string) => void;
}

function LessonCard({ lesson, isDone, onMarkDone }: LessonCardProps) {
  return (
    <div className={styles.lessonCard}>
      <div className={styles.lessonHeader}>
        <span className={styles.lessonTitle}>
          <span aria-hidden="true">{symbols.learn.lesson} </span>
          {lesson.title}
        </span>
        {isDone ? (
          <span className={styles.badgeDone}>
            {symbols.learn.done} {text.learn.completedBadge}
          </span>
        ) : (
          <span className={styles.badgeReady}>{text.learn.availableBadge}</span>
        )}
      </div>

      <div className={styles.sectionBlock}>
        <span className={styles.sectionLabel}>{text.learn.conceptHeading}</span>
        <p className={styles.conceptText}>{lesson.concept}</p>
      </div>

      <WorkedExampleView steps={lesson.workedExample} />

      <div className={styles.actionsBar}>
        <Link to={`/puzzles/${lesson.practicePuzzleId}`} className={styles.practiceLink}>
          {text.learn.startPracticeBtn}
        </Link>
        {!isDone && (
          <button type="button" className={styles.doneBtn} onClick={() => onMarkDone(lesson.id)}>
            {text.learn.markCompletedBtn}
          </button>
        )}
      </div>
    </div>
  );
}

function PathwaySection({
  pathway,
  completedIds,
  onMarkDone,
}: {
  readonly pathway: Pathway;
  readonly completedIds: ReadonlySet<string>;
  readonly onMarkDone: (id: string) => void;
}) {
  return (
    <section className={styles.pathwayCard} aria-labelledby={`pw-${pathway.id}`}>
      <div>
        <h2 id={`pw-${pathway.id}`} className={styles.pathwayTitle}>
          {pathway.title}
        </h2>
        <p className={styles.pathwayDescription}>{pathway.description}</p>
      </div>
      <div className={styles.lessonsList}>
        {pathway.lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            isDone={completedIds.has(lesson.id)}
            onMarkDone={onMarkDone}
          />
        ))}
      </div>
    </section>
  );
}

export function LearnPage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => loadCompletedLessons());

  const handleMarkDone = (lessonId: string) => {
    markLessonCompleted(lessonId);
    setCompletedIds(new Set(loadCompletedLessons()));
  };

  return (
    <div>
      <LearnHeader />
      <div className={styles.pathwaysList}>
        {PATHWAYS.map((pathway) => (
          <PathwaySection
            key={pathway.id}
            pathway={pathway}
            completedIds={completedIds}
            onMarkDone={handleMarkDone}
          />
        ))}
      </div>
    </div>
  );
}
