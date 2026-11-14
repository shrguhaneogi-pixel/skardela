import type { PuzzleType } from "../../puzzle-types/registry";
import { text } from "../../../text/en";
import styles from "./PuzzleSculpture.module.css";

export type FaceDescriptor = {
  type: PuzzleType;
  faceClass: string;
  name: string;
  viewX: number;
  viewY: number;
};

// Metadata for the 6 faces of the 3D cube with canonical 3D perspective viewing angles.
export const cubeFaces: readonly FaceDescriptor[] = [
  {
    type: "latics",
    faceClass: styles.faceFront ?? "",
    name: text.latics.name,
    viewX: -14,
    viewY: -22,
  },
  {
    type: "colour-binary",
    faceClass: styles.faceRight ?? "",
    name: text["colour-binary"].name,
    viewX: -14,
    viewY: -112,
  },
  {
    type: "guzzle",
    faceClass: styles.faceBack ?? "",
    name: text.guzzle.name,
    viewX: -14,
    viewY: -202,
  },
  {
    type: "tilt",
    faceClass: styles.faceLeft ?? "",
    name: text.tilt.name,
    viewX: -14,
    viewY: 68,
  },
  {
    type: "orbital",
    faceClass: styles.faceTop ?? "",
    name: text.orbital.name,
    viewX: -65,
    viewY: -18,
  },
  {
    type: "numpuz",
    faceClass: styles.faceBottom ?? "",
    name: text.numpuz.name,
    viewX: 65,
    viewY: -18,
  },
];

export const fallbackFace: FaceDescriptor = {
  type: "latics",
  faceClass: styles.faceFront ?? "",
  name: text.latics.name,
  viewX: -14,
  viewY: -22,
};
