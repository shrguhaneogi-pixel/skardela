import type { TodayCard } from "../../puzzles";
import type { PuzzleType } from "../../puzzle-types/registry";
import { text } from "../../../text/en";
import { cubeFaces, fallbackFace, type FaceDescriptor } from "./cube-faces";
import { INITIAL_ROT_X, INITIAL_ROT_Y } from "./cube-math";
import { PuzzleSculptureFace } from "./PuzzleSculptureFaces";
import { SculptureActiveBar, SculpturePills } from "./SculptureControls";
import { useCubeRotation } from "./useCubeRotation";
import styles from "./PuzzleSculpture.module.css";

const words = text.home.hero.sculpture;
const emptySolved: readonly string[] = [];

// Finds the direct route to the next unsolved puzzle for the selected type.
function getPuzzleHref(
  type: PuzzleType,
  cards?: readonly TodayCard[],
  solved: readonly string[] = emptySolved,
): string {
  if (!cards) return "#today";
  const card = cards.find((c) => c.type === type);
  if (!card) return "#today";
  const next = card.levels.find((l) => !solved.includes(l.id)) ?? card.levels[0];
  if (!next) return "#today";
  return `/puzzles/${next.id}`;
}

// The signature interactive 3D puzzle sculpture (Logic Cube).
// Shows Skardela's 6 puzzles on rotating faces with pointer and keyboard controls.
export function PuzzleSculpture({
  cards,
  solved,
  onSelectPuzzle,
}: {
  cards?: readonly TodayCard[];
  solved?: readonly string[];
  onSelectPuzzle?: (type: PuzzleType) => void;
}) {
  const { activeType, cubeRef, selectFace, handlePointerDown, handlePointerMove, handlePointerUp } =
    useCubeRotation(onSelectPuzzle);

  const activeFace = cubeFaces.find((f) => f.type === activeType) ?? fallbackFace;
  const playHref = getPuzzleHref(activeType, cards, solved ?? emptySolved);

  return (
    <section
      className={styles.sculptureCard}
      aria-label={words.label}
      data-testid="puzzle-sculpture"
    >
      <div
        className={styles.viewport}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        data-testid="sculpture-viewport"
      >
        <div
          ref={cubeRef}
          className={styles.cube}
          style={{ transform: `rotateX(${INITIAL_ROT_X}deg) rotateY(${INITIAL_ROT_Y}deg)` }}
          data-testid="sculpture-cube"
        >
          {cubeFaces.map((face: FaceDescriptor) => (
            <PuzzleSculptureFace
              key={face.type}
              descriptor={face}
              isActive={activeType === face.type}
            />
          ))}
        </div>
      </div>

      <SculptureActiveBar activeFace={activeFace} playHref={playHref} />
      <SculpturePills activeType={activeType} onSelect={selectFace} />
    </section>
  );
}
