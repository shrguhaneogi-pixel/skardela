// ASD-STE100 Simplified Technical English comments.
// Unit tests for Rubik's Cube 3D vector math, projection, and drag kinematics.

import { describe, expect, it } from "vitest";
import {
  createVec3,
  dotVec2,
  dotVec3,
  evaluateDragKinematics,
  getFaceTangents,
  identifySliceIndices,
  makeLookAtMatrix,
  makePerspectiveMatrix,
  multiplyMat4,
  normalizeVec3,
  quaternionFromAxisAngle,
  rotateVec3ByQuaternion,
  snapToCardinalNormal,
  worldToScreen,
} from "./math.ts";
import { generateInitialCubies } from "./state.ts";

describe("Vector Normalization & Snapping", () => {
  it("normalizes vectors and handles zero vectors safely", () => {
    const zero = normalizeVec3(createVec3(0, 0, 0));
    expect(zero).toEqual({ x: 0, y: 0, z: 0 });

    const v = normalizeVec3(createVec3(3, 0, 4));
    expect(Math.abs(v.x - 0.6)).toBeLessThan(1e-6);
    expect(Math.abs(v.z - 0.8)).toBeLessThan(1e-6);
  });

  it("snaps arbitrary face normals to the nearest cardinal unit vector", () => {
    expect(snapToCardinalNormal(createVec3(0.9, 0.1, -0.2))).toEqual({ x: 1, y: 0, z: 0 });
    expect(snapToCardinalNormal(createVec3(-0.1, 0.95, 0.05))).toEqual({ x: 0, y: 1, z: 0 });
    expect(snapToCardinalNormal(createVec3(0.2, -0.1, -0.88))).toEqual({ x: 0, y: 0, z: -1 });
  });
});

describe("Face Tangents & Projection", () => {
  it("returns correct orthogonal tangents for all cardinal faces", () => {
    const [tx1, tx2] = getFaceTangents(createVec3(1, 0, 0));
    expect(dotVec3(createVec3(1, 0, 0), tx1)).toBe(0);
    expect(dotVec3(createVec3(1, 0, 0), tx2)).toBe(0);
    expect(dotVec3(tx1, tx2)).toBe(0);

    const [ty1, ty2] = getFaceTangents(createVec3(0, 1, 0));
    expect(dotVec3(createVec3(0, 1, 0), ty1)).toBe(0);
    expect(dotVec3(createVec3(0, 1, 0), ty2)).toBe(0);
    expect(dotVec3(ty1, ty2)).toBe(0);

    const [tz1, tz2] = getFaceTangents(createVec3(0, 0, 1));
    expect(dotVec3(createVec3(0, 0, 1), tz1)).toBe(0);
    expect(dotVec3(createVec3(0, 0, 1), tz2)).toBe(0);
    expect(dotVec3(tz1, tz2)).toBe(0);
  });

  it("projects 3D world coordinates through perspective and lookAt matrices", () => {
    const eye = createVec3(0, 0, 10);
    const target = createVec3(0, 0, 0);
    const up = createVec3(0, 1, 0);

    const view = makeLookAtMatrix(eye, target, up);
    const proj = makePerspectiveMatrix(Math.PI / 4, 1.0, 0.1, 100);
    const viewProj = multiplyMat4(proj, view);

    const screenPos = worldToScreen(createVec3(0, 0, 0), viewProj, 800, 600);
    // Center point in screen space must be width/2, height/2.
    expect(Math.abs(screenPos.x - 400)).toBeLessThan(1e-4);
    expect(Math.abs(screenPos.y - 300)).toBeLessThan(1e-4);
  });
});

describe("Slice Identification", () => {
  it("identifies exactly 9 cubies for any slice rotation", () => {
    const cubies = generateInitialCubies();
    const positions = cubies.map((c) => c.currentPosition);

    const uSlice = identifySliceIndices(positions, 26, createVec3(0, 1, 0));
    expect(uSlice.length).toBe(9);
    for (const idx of uSlice) {
      expect(positions[idx]?.y).toBe(1);
    }

    const rSlice = identifySliceIndices(positions, 26, createVec3(1, 0, 0));
    expect(rSlice.length).toBe(9);
    for (const idx of rSlice) {
      expect(positions[idx]?.x).toBe(1);
    }

    const fSlice = identifySliceIndices(positions, 26, createVec3(0, 0, 1));
    expect(fSlice.length).toBe(9);
    for (const idx of fSlice) {
      expect(positions[idx]?.z).toBe(1);
    }
  });
});

describe("Drag Kinematics Locking", () => {
  it("evaluates buttonless 2D drag kinematics and locks axis with correct screen tangent", () => {
    const eye = createVec3(4.2, 3.8, 5.2);
    const target = createVec3(0, 0, 0);
    const up = createVec3(0, 1, 0);

    const view = makeLookAtMatrix(eye, target, up);
    const proj = makePerspectiveMatrix(Math.PI / 4, 800 / 600, 0.1, 100);
    const viewProj = multiplyMat4(proj, view);

    const smallDrag = evaluateDragKinematics(
      createVec3(0, 0, 1),
      createVec3(0, 0, 1),
      { x: 3, y: 2 },
      viewProj,
      800,
      600,
      8,
    );
    expect(smallDrag.isLocked).toBe(false);
    expect(smallDrag.selectedAxis).toBeNull();
    expect(smallDrag.selectedScreenTangent).toBeNull();

    const horizontalDrag = evaluateDragKinematics(
      createVec3(0, 0, 1),
      createVec3(0, 0, 1),
      { x: 45, y: 0 },
      viewProj,
      800,
      600,
      8,
    );
    expect(horizontalDrag.isLocked).toBe(true);
    expect(horizontalDrag.selectedAxis).toEqual({ x: 0, y: 1, z: 0 });
    expect(horizontalDrag.selectedScreenTangent?.x).toBeGreaterThan(0);
  });
});

describe("Drag Direction Alignment", () => {
  it("ensures dragged face always moves in screen direction of pointer for all visible faces", () => {
    const eye = createVec3(4.2, 3.8, 5.2);
    const view = makeLookAtMatrix(eye, createVec3(0, 0, 0), createVec3(0, 1, 0));
    const proj = makePerspectiveMatrix(Math.PI / 4, 800 / 600, 0.1, 100);
    const vp = multiplyMat4(proj, view);

    const visibleFaces = [
      { name: "Front (+Z)", normal: createVec3(0, 0, 1), hit: createVec3(0, 0, 1) },
      { name: "Top (+Y)", normal: createVec3(0, 1, 0), hit: createVec3(0, 1, 0) },
      { name: "Right (+X)", normal: createVec3(1, 0, 0), hit: createVec3(1, 0, 0) },
    ];
    const testDrags = [
      { x: 60, y: 0 },
      { x: -60, y: 0 },
      { x: 0, y: 60 },
      { x: 0, y: -60 },
    ];

    for (const f of visibleFaces) {
      for (const d of testDrags) {
        const kin = evaluateDragKinematics(f.hit, f.normal, d, vp, 800, 600, 8);
        expect(kin.isLocked).toBe(true);

        const dragPixels = dotVec2(d, kin.selectedScreenTangent!);
        const angle = dragPixels * 0.008;

        const q = quaternionFromAxisAngle(kin.selectedAxis!, angle);
        const pRot = rotateVec3ByQuaternion(f.hit, q);

        const pBaseScreen = worldToScreen(f.hit, vp, 800, 600);
        const pRotScreen = worldToScreen(pRot, vp, 800, 600);
        const screenMotion = {
          x: pRotScreen.x - pBaseScreen.x,
          y: pRotScreen.y - pBaseScreen.y,
        };

        const alignment = dotVec2(screenMotion, d);
        expect(alignment).toBeGreaterThan(0);
      }
    }
  });
});
