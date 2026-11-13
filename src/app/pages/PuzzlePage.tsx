/* oxlint-disable import/max-dependencies, eslint/max-lines-per-function */
import { Suspense, ViewTransition, useEffect, useState, type ComponentType } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { ErrorBoundary } from "../../shared/ErrorBoundary";
import { KeyList, RuleList, type KeyItem, type Rule } from "../../shared/RuleList";
import { text } from "../../text/en";
import { isTodayUtc, type LoadedPuzzle, type puzzleLoader } from "../puzzles";
import { RandomPuzzleButton } from "../RandomPuzzleButton";
import { boards } from "../puzzle-types/boards";
import { NotFoundPage } from "./NotFoundPage";
import { PlayTimer } from "./PlayTimer";
import { ConfirmQuestion } from "../../shared/ConfirmQuestion";
import { useConfirm } from "../../shared/useConfirm";
import { useAppStore } from "../../shared/state/store";
import { Button } from "../../shared/ui/Button";
import styles from "./PuzzlePage.module.css";

// ASD-STE100 Simplified Technical English comments.
// This shows the board of the puzzle type.
function PuzzleBoard({ loaded }: { loaded: LoadedPuzzle }) {
  const Board = boards[loaded.type] as unknown as ComponentType<{
    puzzle: LoadedPuzzle["puzzle"];
  }>;
  return <Board puzzle={loaded.puzzle} />;
}

type HeaderProps = {
  typeName: string;
  difficulty: keyof typeof text.levels;
  puzzleId: string;
  author: string;
  dateParam: string | null;
  isArchive: boolean;
};

function PuzzleDetailsHeader(props: HeaderProps) {
  const page = text.puzzlePage;
  const validDate =
    props.dateParam && /^\d{4}-\d{2}-\d{2}$/.test(props.dateParam) ? props.dateParam : null;
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{props.typeName}</h1>
      <div className={styles.details}>
        <ul className={styles.details} aria-label={page.detailsLabel}>
          <li className={styles.level}>{text.levels[props.difficulty]}</li>
          {props.isArchive && validDate && (
            <li className={styles.archiveBadge}>{text.archive.archiveBadge(validDate)}</li>
          )}
          <li>{page.puzzleNumber(props.puzzleId.slice(props.puzzleId.lastIndexOf("-") + 1))}</li>
          <li>{page.author(props.author)}</li>
          <li>
            <PlayTimer puzzleId={props.puzzleId} />
          </li>
        </ul>
        <RandomPuzzleButton excludeId={props.puzzleId} label={page.randomButton} />
      </div>
    </header>
  );
}

type PuzzleRulesPanelProps = {
  rules: readonly Rule[];
  rulesKey?: readonly KeyItem[];
  moreRules?: { label: string; rules: readonly Rule[] };
  puzzleType: string;
  puzzleId: string;
  onRestart: () => void;
};

function PuzzleRulesPanel({
  rules,
  rulesKey,
  moreRules,
  puzzleType,
  puzzleId,
  onRestart,
}: PuzzleRulesPanelProps) {
  const page = text.puzzlePage;
  const { isOpen, buttonRef, yesRef, open, close } = useConfirm(puzzleId);
  const seenRules = useAppStore((state) => state.seenRules);
  const seeRules = useAppStore((state) => state.seeRules);

  useEffect(() => {
    seeRules(puzzleType);
  }, [puzzleType, seeRules]);

  return (
    <section aria-labelledby="rules-heading" className={`sk-surface-card ${styles.rules}`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800">
        {isOpen ? (
          <ConfirmQuestion
            question={page.restartQuestion}
            yes={page.restartYes}
            no={page.restartNo}
            yesRef={yesRef}
            onYes={() => {
              onRestart();
              close();
            }}
            onNo={close}
          />
        ) : (
          <Button ref={buttonRef} variant="secondary" size="sm" onClick={open}>
            {page.restart}
          </Button>
        )}
      </div>
      <h2 id="rules-heading">{page.rulesHeading}</h2>
      <RuleList rules={rules} />
      {rulesKey && rulesKey.length > 0 && (
        <div className="mt-3">
          <KeyList items={rulesKey} label="Rules key" />
        </div>
      )}
      {moreRules && (
        <details
          className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 text-sm"
          open={!seenRules.includes(puzzleType)}
        >
          <summary className="cursor-pointer font-medium text-stone-800 dark:text-stone-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors select-none py-1">
            {moreRules.label}
          </summary>
          <div className="mt-2 text-stone-600 dark:text-stone-400">
            <RuleList rules={moreRules.rules} />
          </div>
        </details>
      )}
    </section>
  );
}

function PuzzleBoardView({
  loaded,
  dateParam,
  isArchive,
}: {
  loaded: LoadedPuzzle;
  dateParam: string | null;
  isArchive: boolean;
}) {
  const [boardKey, setBoardKey] = useState(0);
  const { puzzle } = loaded;
  const typeText = text[loaded.type];
  const page = text.puzzlePage;

  return (
    <div className={styles.page}>
      <title>{page.title(typeText.name, puzzle.id, text.siteName)}</title>
      <PuzzleDetailsHeader
        typeName={typeText.name}
        difficulty={puzzle.difficulty}
        puzzleId={puzzle.id}
        author={puzzle.author}
        dateParam={dateParam}
        isArchive={isArchive}
      />
      <div className={styles.layout}>
        <div className={styles.play}>
          <ErrorBoundary
            key={`${puzzle.id}-${boardKey}`}
            fallback={
              <p role="alert" className={styles.error}>
                {page.boardError}
              </p>
            }
          >
            <Suspense fallback={<p className={styles.loading}>{page.loadingBoard}</p>}>
              <ViewTransition>
                <PuzzleBoard key={`${puzzle.id}-${boardKey}`} loaded={loaded} />
              </ViewTransition>
            </Suspense>
          </ErrorBoundary>
        </div>

        <PuzzleRulesPanel
          rules={typeText.rules}
          rulesKey={"rulesKey" in typeText ? typeText.rulesKey : undefined}
          moreRules={"moreRules" in typeText ? typeText.moreRules : undefined}
          puzzleType={loaded.type}
          puzzleId={puzzle.id}
          onRestart={() => setBoardKey((k) => k + 1)}
        />
      </div>
    </div>
  );
}

// This page shows the active puzzle board and the rule instructions.
export function PuzzlePage() {
  const loaded = useLoaderData<typeof puzzleLoader>();
  const [searchParams] = useSearchParams();
  const rawDate = searchParams.get("date");
  const dateParam = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;
  const isArchive = !isTodayUtc(dateParam);

  useEffect(() => {
    if (loaded?.puzzle) {
      useAppStore.getState().openPuzzle({
        puzzleId: loaded.puzzle.id,
        type: loaded.type,
        difficulty: loaded.puzzle.difficulty,
      });
    }
  }, [loaded]);

  if (!loaded) return <NotFoundPage />;

  return <PuzzleBoardView loaded={loaded} dateParam={dateParam} isArchive={isArchive} />;
}
