import { Suspense, type ComponentType } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { ErrorBoundary } from "../../shared/ErrorBoundary";
import { RuleList } from "../../shared/RuleList";
import { text } from "../../text/en";
import { isTodayUtc, type puzzleLoader } from "../puzzles";
import { boards } from "../puzzle-types/boards";
import type { PuzzleMap, PuzzleType } from "../puzzle-types/registry";
import { NotFoundPage } from "./NotFoundPage";
import styles from "./PuzzlePage.module.css";

// This shows the board of the puzzle type.
function PuzzleBoard<Type extends PuzzleType>({
  type,
  puzzle,
}: {
  type: Type;
  puzzle: PuzzleMap[Type];
}) {
  const Board: ComponentType<{ puzzle: PuzzleMap[Type] }> = boards[type];
  return <Board puzzle={puzzle} />;
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
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{props.typeName}</h1>
      <ul className={styles.details} aria-label={page.detailsLabel}>
        <li className={styles.level}>{text.levels[props.difficulty]}</li>
        {props.isArchive && props.dateParam && (
          <li className={styles.archiveBadge}>{text.archive.archiveBadge(props.dateParam)}</li>
        )}
        <li>{page.puzzleNumber(props.puzzleId.slice(props.puzzleId.lastIndexOf("-") + 1))}</li>
        <li>{page.author(props.author)}</li>
      </ul>
    </header>
  );
}

// This page shows the active puzzle board and the rule instructions.
export function PuzzlePage() {
  const loaded = useLoaderData<typeof puzzleLoader>();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const isArchive = !isTodayUtc(dateParam);

  if (!loaded) return <NotFoundPage />;

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
            key={puzzle.id}
            fallback={
              <p role="alert" className={styles.error}>
                {page.boardError}
              </p>
            }
          >
            <Suspense fallback={<p className={styles.loading}>{page.loadingBoard}</p>}>
              <PuzzleBoard type={loaded.type} puzzle={loaded.puzzle} />
            </Suspense>
          </ErrorBoundary>
        </div>

        <section aria-labelledby="rules-heading" className={styles.rules}>
          <h2 id="rules-heading">{page.rulesHeading}</h2>
          <RuleList rules={typeText.rules} />
        </section>
      </div>
    </div>
  );
}
