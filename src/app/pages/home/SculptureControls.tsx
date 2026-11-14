import type { KeyboardEvent } from "react";
import { Link } from "react-router";
import type { PuzzleType } from "../../puzzle-types/registry";
import { text } from "../../../text/en";
import { cubeFaces, type FaceDescriptor } from "./cube-faces";
import styles from "./PuzzleSculpture.module.css";

const words = text.home.hero.sculpture;

export function SculptureActiveBar({
  activeFace,
  playHref,
}: {
  activeFace: FaceDescriptor;
  playHref?: string;
}) {
  const href = playHref ?? "#today";
  const isRouterLink = href.startsWith("/");
  return (
    <div className={styles.activeBar}>
      <div className={styles.activeInfo}>
        <span className={styles.activeKicker}>{words.hint}</span>
        <span
          className={styles.activeName}
          data-testid="active-sculpture-name"
          aria-live="polite"
          aria-atomic="true"
        >
          {activeFace.name}
        </span>
      </div>
      {isRouterLink ? (
        <Link to={href} className={styles.playLink} data-testid="sculpture-play-link">
          {words.playPuzzle(activeFace.name)}
        </Link>
      ) : (
        <a href={href} className={styles.playLink} data-testid="sculpture-play-link">
          {words.playPuzzle(activeFace.name)}
        </a>
      )}
    </div>
  );
}

export function SculpturePills({
  activeType,
  onSelect,
}: {
  activeType: PuzzleType;
  onSelect: (type: PuzzleType) => void;
}) {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = currentIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % cubeFaces.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + cubeFaces.length) % cubeFaces.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = cubeFaces.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    const target = cubeFaces[nextIndex];
    if (target) {
      onSelect(target.type);
      const buttons = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button");
      buttons?.[nextIndex]?.focus();
    }
  };

  return (
    <nav className={styles.pills} aria-label={words.label}>
      {cubeFaces.map((face: FaceDescriptor, index: number) => {
        const isSelected = activeType === face.type;
        return (
          <button
            key={face.type}
            type="button"
            className={styles.pill}
            aria-pressed={isSelected}
            aria-label={words.selectFace(face.name)}
            onClick={() => onSelect(face.type)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {face.name}
          </button>
        );
      })}
    </nav>
  );
}
