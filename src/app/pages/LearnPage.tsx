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
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import { buttonVariants } from "../../shared/ui/button-variants";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import styles from "./LearnPage.module.css";

function LearnHeader() {
  return (
    <section className="sk-hero">
      <h1>
        <span aria-hidden="true">{symbols.learn.pathway} </span>
        {text.learn.title}
      </h1>
      <p className="sk-intro">{text.learn.intro}</p>
      <div className="sk-disclaimer" role="note">
        {text.learn.disclaimer}
      </div>
    </section>
  );
}

function WorkedExampleView({ steps }: { readonly steps: readonly WorkedExampleStep[] }) {
  return (
    <div className={styles.sectionBlock}>
      <span className="sk-eyebrow">{text.learn.workedExampleHeading}</span>
      <div className={styles.workedExampleBox}>
        {steps.map((step, idx) => (
          <div key={step.title} className={styles.exampleStep}>
            <span className={styles.stepTitle}>
              {symbols.learn.step} {text.learn.stepNumber(idx + 1)}: {step.title}
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
          <Badge variant="success">
            {symbols.learn.done} {text.learn.completedBadge}
          </Badge>
        ) : (
          <Badge variant="muted">{text.learn.availableBadge}</Badge>
        )}
      </div>

      <div className={styles.sectionBlock}>
        <span className="sk-eyebrow">{text.learn.conceptHeading}</span>
        <p className={styles.conceptText}>{lesson.concept}</p>
      </div>

      <WorkedExampleView steps={lesson.workedExample} />

      <div className={styles.actionsBar}>
        <Link
          to={`/puzzles/${lesson.practicePuzzleId}`}
          className={buttonVariants({ variant: "primary", size: "sm" })}
          viewTransition
        >
          {text.learn.startPracticeBtn}
        </Link>
        {!isDone && (
          <Button variant="secondary" size="sm" onClick={() => onMarkDone(lesson.id)}>
            {text.learn.markCompletedBtn}
          </Button>
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
    <section
      className={`sk-surface-card sk-surface-card-interactive ${styles.pathwayCard}`}
      aria-labelledby={`pw-${pathway.id}`}
    >
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
