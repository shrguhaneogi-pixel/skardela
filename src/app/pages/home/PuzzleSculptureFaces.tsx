import type { PuzzleType } from "../../puzzle-types/registry";
import { symbols } from "../../../text/symbols";
import type { FaceDescriptor } from "./cube-faces";
import styles from "./PuzzleSculpture.module.css";

// Precision graphic representation for each puzzle face on the 3D sculpture.
// Each face shows the authentic mechanics and tokens of one of Skardela's 6 puzzles.

function LaticsFaceGraphic() {
  return (
    <svg className={styles.graphicSvg} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <rect x="10" y="10" width="100" height="100" rx="8" className={styles.graphicGridBg} />
      <line x1="10" y1="40" x2="110" y2="40" className={styles.graphicGridLine} />
      <line x1="10" y1="70" x2="110" y2="70" className={styles.graphicGridLine} />
      <line x1="40" y1="10" x2="40" y2="110" className={styles.graphicGridLine} />
      <line x1="70" y1="10" x2="70" y2="110" className={styles.graphicGridLine} />

      <circle cx="25" cy="85" r="10" className={styles.laticsLaser} />
      <polyline points="25,85 85,85 85,25" className={styles.laticsBeam} />
      <line x1="73" y1="97" x2="97" y2="73" className={styles.laticsMirror} />
      <circle cx="85" cy="25" r="8" className={styles.laticsTarget} />
    </svg>
  );
}

const binaryGrid = [
  "red",
  "blue",
  "muted",
  "red",
  "muted",
  "red",
  "blue",
  "blue",
  "blue",
  "muted",
  "red",
  "muted",
  "red",
  "blue",
  "muted",
  "blue",
] as const;

function ColourBinaryFaceGraphic() {
  return (
    <div className={styles.binaryGrid} aria-hidden="true">
      {binaryGrid.map((type, i) => (
        // oxlint-disable-next-line react/no-array-index-key -- static tiles never reorder.
        <span key={i} className={styles.binaryTile} data-tile={type} />
      ))}
    </div>
  );
}

function OrbitalFaceGraphic() {
  return (
    <svg className={styles.graphicSvg} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <rect x="10" y="10" width="100" height="100" rx="8" className={styles.graphicGridBg} />
      <circle cx="55" cy="65" r="18" className={styles.orbitalPlanet} />
      <path d="M20,100 C15,35 65,25 95,35" className={styles.orbitalPath} />
      <circle cx="95" cy="35" r="12" className={styles.orbitalRing} />
      <polygon points="18,94 26,102 18,106 21,100" className={styles.orbitalProbe} />
    </svg>
  );
}

function TiltFaceGraphic() {
  return (
    <svg className={styles.graphicSvg} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <rect x="10" y="10" width="100" height="100" rx="8" className={styles.graphicGridBg} />
      <rect x="50" y="50" width="22" height="22" rx="4" className={styles.tiltWall} />
      <line x1="28" y1="36" x2="88" y2="36" className={styles.tiltPath} />
      <circle cx="32" cy="36" r="10" className={styles.tiltBall} />
      <circle cx="90" cy="36" r="11" className={styles.tiltHole} />
    </svg>
  );
}

function NumpuzFaceGraphic() {
  return (
    <div className={styles.numpuzGrid} aria-hidden="true">
      <span className={styles.numpuzTile}>8</span>
      <span className={styles.numpuzTile} data-operator="true">
        {symbols.numpuz.operators["\u00F7"]}
      </span>
      <span className={styles.numpuzTile}>2</span>
      <span className={styles.numpuzEquals}>= 4</span>
    </div>
  );
}

const guzzleLetters = ["", "B", "", "C", "A", "T", "", "G", ""];

function GuzzleFaceGraphic() {
  return (
    <div className={styles.guzzleGrid} aria-hidden="true">
      {guzzleLetters.map((char, index) => (
        <span
          // oxlint-disable-next-line react/no-array-index-key -- crossword tiles are static.
          key={index}
          className={styles.guzzleTile}
          data-center={index === 4}
          data-empty={char === ""}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

// Maps each puzzle type to its custom graphic renderer.
const graphics: Record<PuzzleType, () => React.JSX.Element> = {
  latics: LaticsFaceGraphic,
  "colour-binary": ColourBinaryFaceGraphic,
  orbital: OrbitalFaceGraphic,
  tilt: TiltFaceGraphic,
  numpuz: NumpuzFaceGraphic,
  guzzle: GuzzleFaceGraphic,
};

export function PuzzleSculptureFace({
  descriptor,
  isActive,
}: {
  descriptor: FaceDescriptor;
  isActive: boolean;
}) {
  const Graphic = graphics[descriptor.type];

  return (
    <div
      className={`${styles.face} ${descriptor.faceClass}`}
      data-active={isActive ? "true" : undefined}
      data-face-type={descriptor.type}
      data-testid={`sculpture-face-${descriptor.type}`}
    >
      <div className={styles.faceHeader}>
        <span className={styles.faceKicker}>{descriptor.name}</span>
        <span className={styles.faceBadge} aria-hidden="true" />
      </div>
      <div className={styles.faceBody}>
        <Graphic />
      </div>
    </div>
  );
}
