// ASD-STE100 Simplified Technical English comments.
// Comprehensive unit tests for Rubik's Cube 3D math, kinematics, spring physics, and LLM state.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  addVec3,
  cleanCubiePosition,
  createIdentityMat4,
  createVec3,
  crossVec3,
  dotVec2,
  dotVec3,
  evaluateDragKinematics,
  getFaceTangents,
  identifySliceIndices,
  makeLookAtMatrix,
  makePerspectiveMatrix,
  multiplyMat4,
  multiplyQuaternions,
  normalizeVec2,
  normalizeVec3,
  projectPoint,
  quaternionFromAxisAngle,
  rotateVec3ByQuaternion,
  snapQuaternionToOrtho,
  snapToCardinalNormal,
  worldToScreen,
} from "./math.ts";
import {
  computeSnapAngle,
  createSpringState,
  DEFAULT_SPRING_CONFIG,
  stepSpring,
  VelocityTracker,
} from "./spring.ts";
import {
  applyMoveToCubies,
  evaluateCubeState,
  extractFacelets54,
  generateInitialCubies,
  generateRandomScramble,
  getSingmasterMove,
  parseSingmasterMove,
} from "./state.ts";

describe("Rubik's 3D Math & Projection", () => {
  it("normalizes vectors and handles zero vectors safely", () => {
    const zero = normalizeVec3(createVec3(0, 0, 0));
    assert.deepEqual(zero, { x: 0, y: 0, z: 0 });

    const v = normalizeVec3(createVec3(3, 0, 4));
    assert.ok(Math.abs(v.x - 0.6) < 1e-6);
    assert.ok(Math.abs(v.z - 0.8) < 1e-6);
  });

  it("snaps arbitrary face normals to the nearest cardinal unit vector", () => {
    assert.deepEqual(snapToCardinalNormal(createVec3(0.9, 0.1, -0.2)), { x: 1, y: 0, z: 0 });
    assert.deepEqual(snapToCardinalNormal(createVec3(-0.1, 0.95, 0.05)), { x: 0, y: 1, z: 0 });
    assert.deepEqual(snapToCardinalNormal(createVec3(0.2, -0.1, -0.88)), { x: 0, y: 0, z: -1 });
  });

  it("returns correct orthogonal tangents for all cardinal faces", () => {
    const [tx1, tx2] = getFaceTangents(createVec3(1, 0, 0));
    assert.equal(dotVec3(createVec3(1, 0, 0), tx1), 0);
    assert.equal(dotVec3(createVec3(1, 0, 0), tx2), 0);
    assert.equal(dotVec3(tx1, tx2), 0);

    const [ty1, ty2] = getFaceTangents(createVec3(0, 1, 0));
    assert.equal(dotVec3(createVec3(0, 1, 0), ty1), 0);
    assert.equal(dotVec3(createVec3(0, 1, 0), ty2), 0);

    const [tz1, tz2] = getFaceTangents(createVec3(0, 0, 1));
    assert.equal(dotVec3(createVec3(0, 0, 1), tz1), 0);
    assert.equal(dotVec3(createVec3(0, 0, 1), tz2), 0);
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
    assert.ok(Math.abs(screenPos.x - 400) < 1e-4);
    assert.ok(Math.abs(screenPos.y - 300) < 1e-4);
  });

  it("identifies exactly 9 cubies for any slice rotation", () => {
    const cubies = generateInitialCubies();
    const positions = cubies.map((c) => c.currentPosition);

    // Click front-top-right cubie (1, 1, 1).
    // Rotation around Y (U layer): must yield exactly 9 cubies.
    const uSlice = identifySliceIndices(positions, 26, createVec3(0, 1, 0));
    assert.equal(uSlice.length, 9);
    for (const idx of uSlice) {
      assert.equal(positions[idx]?.y, 1);
    }

    // Rotation around X (R layer): must yield exactly 9 cubies.
    const rSlice = identifySliceIndices(positions, 26, createVec3(1, 0, 0));
    assert.equal(rSlice.length, 9);
    for (const idx of rSlice) {
      assert.equal(positions[idx]?.x, 1);
    }

    // Rotation around Z (F layer): must yield exactly 9 cubies.
    const fSlice = identifySliceIndices(positions, 26, createVec3(0, 0, 1));
    assert.equal(fSlice.length, 9);
    for (const idx of fSlice) {
      assert.equal(positions[idx]?.z, 1);
    }
  });

  it("evaluates buttonless 2D drag kinematics and locks axis with correct screen tangent", () => {
    const eye = createVec3(4.2, 3.8, 5.2);
    const target = createVec3(0, 0, 0);
    const up = createVec3(0, 1, 0);

    const view = makeLookAtMatrix(eye, target, up);
    const proj = makePerspectiveMatrix(Math.PI / 4, 800 / 600, 0.1, 100);
    const viewProj = multiplyMat4(proj, view);

    // Drag below threshold: must not lock.
    const smallDrag = evaluateDragKinematics(
      createVec3(0, 0, 1),
      createVec3(0, 0, 1),
      { x: 3, y: 2 },
      viewProj,
      800,
      600,
      8,
    );
    assert.equal(smallDrag.isLocked, false);
    assert.equal(smallDrag.selectedAxis, null);
    assert.equal(smallDrag.selectedScreenTangent, null);

    // Drag horizontally on front face (normal +Z):
    // Rotation axis must be normal cross tangent = (0,0,1) cross (1,0,0) = (0,1,0).
    const horizontalDrag = evaluateDragKinematics(
      createVec3(0, 0, 1),
      createVec3(0, 0, 1),
      { x: 45, y: 0 },
      viewProj,
      800,
      600,
      8,
    );
    assert.equal(horizontalDrag.isLocked, true);
    assert.ok(horizontalDrag.selectedAxis !== null);
    assert.equal(horizontalDrag.selectedAxis.x, 0);
    assert.equal(horizontalDrag.selectedAxis.y, 1);
    assert.equal(horizontalDrag.selectedAxis.z, 0);
    assert.ok(horizontalDrag.selectedScreenTangent !== null);
    assert.ok(horizontalDrag.selectedScreenTangent.x > 0);
  });

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
        assert.equal(kin.isLocked, true);
        assert.ok(kin.selectedAxis !== null);
        assert.ok(kin.selectedScreenTangent !== null);

        const dragPixels = dotVec2(d, kin.selectedScreenTangent);
        const angle = dragPixels * 0.008;

        const q = quaternionFromAxisAngle(kin.selectedAxis, angle);
        const pRot = rotateVec3ByQuaternion(f.hit, q);

        const pBaseScreen = worldToScreen(f.hit, vp, 800, 600);
        const pRotScreen = worldToScreen(pRot, vp, 800, 600);
        const screenMotion = {
          x: pRotScreen.x - pBaseScreen.x,
          y: pRotScreen.y - pBaseScreen.y,
        };

        const alignment = dotVec2(screenMotion, d);
        // Face motion in screen space must be positively aligned with mouse drag direction.
        assert.ok(alignment > 0, `Face ${f.name} misaligned with drag (${d.x}, ${d.y}): alignment=${alignment}`);
      }
    }
  });
});

describe("Rubik's Spring Physics & Motion", () => {
  it("computes snap angle to nearest 90-degree quadrant", () => {
    const snap1 = computeSnapAngle(1.1, 0, DEFAULT_SPRING_CONFIG);
    assert.ok(Math.abs(snap1 - Math.PI * 0.5) < 1e-4);

    const snap2 = computeSnapAngle(0.1, 0, DEFAULT_SPRING_CONFIG);
    assert.equal(snap2, 0);

    const snap3 = computeSnapAngle(-1.2, 0, DEFAULT_SPRING_CONFIG);
    assert.ok(Math.abs(snap3 - (-Math.PI * 0.5)) < 1e-4);
  });

  it("triggers momentum flick when pointer release velocity exceeds threshold", () => {
    // Current angle is small (0.2), but user flicked fast positive:
    const flickSnap = computeSnapAngle(0.2, 4.5, DEFAULT_SPRING_CONFIG);
    assert.ok(Math.abs(flickSnap - Math.PI * 0.5) < 1e-4);

    // Negative fast flick:
    const negFlickSnap = computeSnapAngle(-0.2, -4.5, DEFAULT_SPRING_CONFIG);
    assert.ok(Math.abs(negFlickSnap - (-Math.PI * 0.5)) < 1e-4);
  });

  it("steps spring simulation until equilibrium settling", () => {
    let state = createSpringState(0.5);
    state.target = Math.PI * 0.5;
    state.isSettled = false;

    // Simulate spring physics for 60 frames (1 second at 60fps).
    for (let frame = 0; frame < 60; frame++) {
      state = stepSpring(state, 1.0 / 60.0, DEFAULT_SPRING_CONFIG);
      if (state.isSettled) break;
    }

    assert.equal(state.isSettled, true);
    assert.ok(Math.abs(state.position - Math.PI * 0.5) < 1e-4);
    assert.equal(state.velocity, 0);
  });

  it("tracks pointer velocity smoothly", () => {
    const tracker = new VelocityTracker();
    tracker.reset(0, 1000);
    tracker.update(0.1, 1050); // 0.1 rad in 50ms = 2.0 rad/s
    tracker.update(0.2, 1100);
    assert.ok(tracker.getVelocity() > 1.0);
  });

  it("spring clamps delta time under heavy frame drops to prevent instability", () => {
    const state = createSpringState(1.2);
    state.target = Math.PI * 0.5;
    state.isSettled = false;

    // Simulate a massive 5.0 second lag spike.
    const stepped = stepSpring(state, 5.0, DEFAULT_SPRING_CONFIG);
    assert.ok(!Number.isNaN(stepped.position));
    assert.ok(!Number.isNaN(stepped.velocity));
    assert.ok(Math.abs(stepped.velocity) < 100);
  });
});

describe("LLM Cube State & Singmaster Moves", () => {
  it("initializes a solved 54-facelet state", () => {
    const cubies = generateInitialCubies();
    assert.equal(cubies.length, 27);

    const facelets = extractFacelets54(cubies);
    assert.equal(facelets.length, 54);
    assert.equal(facelets, "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB");

    const evalState = evaluateCubeState(facelets);
    assert.equal(evalState.isSolved, true);
    assert.equal(evalState.entropy, 0);
    assert.ok(evalState.llmPromptSnippet.includes("solved=true"));
  });

  it("applies standard Singmaster clockwise moves and produces exact notations", () => {
    const cubies = generateInitialCubies();

    // Standard U move rotates by -PI/2 around +Y (layer 1).
    const moved = applyMoveToCubies(cubies, createVec3(0, 1, 0), 1, -Math.PI * 0.5);
    const faceletsU = extractFacelets54(moved);
    assert.notEqual(faceletsU, "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB");

    // Top rows cycle: F becomes R, R becomes B, B becomes L, L becomes F.
    assert.equal(faceletsU.slice(0, 9), "UUUUUUUUU");
    assert.equal(faceletsU.slice(9, 18), "BBBRRRRRR");
    assert.equal(faceletsU.slice(18, 27), "RRRFFFFFF");
    assert.equal(faceletsU.slice(36, 45), "FFFLLLLLL");
    assert.equal(faceletsU.slice(45, 54), "LLLBBBBBB");

    const moveName = getSingmasterMove(createVec3(0, 1, 0), 1, -Math.PI * 0.5);
    assert.equal(moveName, "U");

    const moveNamePrime = getSingmasterMove(createVec3(0, 1, 0), 1, Math.PI * 0.5);
    assert.equal(moveNamePrime, "U'");
  });

  it("guarantees round-trip between parseSingmasterMove and getSingmasterMove for all moves", () => {
    const allMoves = [
      "U", "U'", "U2",
      "D", "D'", "D2",
      "R", "R'", "R2",
      "L", "L'", "L2",
      "F", "F'", "F2",
      "B", "B'", "B2",
      "M", "M'", "M2",
      "E", "E'", "E2",
      "S", "S'", "S2",
    ];

    for (const m of allMoves) {
      const parsed = parseSingmasterMove(m);
      assert.ok(parsed !== null, `Failed to parse ${m}`);
      const recovered = getSingmasterMove(parsed.axis, parsed.layer, parsed.angle);
      assert.equal(recovered, m, `Mismatch round-trip for ${m}: got ${recovered}`);
    }
  });

  it("canonicalizes negative axis vectors in getSingmasterMove", () => {
    // Rotation around (0, -1, 0) at layer -1 with angle PI/2 is equivalent to (0, 1, 0) at layer 1 with -PI/2 = U.
    const move = getSingmasterMove(createVec3(0, -1, 0), -1, Math.PI * 0.5);
    assert.equal(move, "U");
  });

  it("restores solved state after 4 identical 90-degree turns (U4 = Identity)", () => {
    let cubies = generateInitialCubies();
    for (let i = 0; i < 4; i++) {
      cubies = applyMoveToCubies(cubies, createVec3(0, 1, 0), 1, -Math.PI * 0.5);
    }

    const facelets = extractFacelets54(cubies);
    assert.equal(facelets, "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB");
    assert.equal(evaluateCubeState(facelets).isSolved, true);
  });

  it("restores solved state after 6 sexy-move sequences ((R U R' U') * 6 = Identity)", () => {
    let cubies = generateInitialCubies();
    const sexyMoves = ["R", "U", "R'", "U'"];

    for (let cycle = 0; cycle < 6; cycle++) {
      for (const m of sexyMoves) {
        const parsed = parseSingmasterMove(m);
        assert.ok(parsed !== null);
        cubies = applyMoveToCubies(cubies, parsed.axis, parsed.layer, parsed.angle);
      }
    }

    const facelets = extractFacelets54(cubies);
    assert.equal(facelets, "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB");
    assert.equal(evaluateCubeState(facelets).isSolved, true);
  });

  it("handles edge cases: invalid moves, empty strings, and null returns", () => {
    assert.equal(parseSingmasterMove(""), null);
    assert.equal(parseSingmasterMove("   "), null);
    assert.equal(parseSingmasterMove("INVALID"), null);
    assert.equal(parseSingmasterMove("Z"), null);
    assert.equal(getSingmasterMove(createVec3(0, 1, 0), 1, 0), "");
  });

  it("generates valid random scrambles with no consecutive identical face moves", () => {
    const scramble = generateRandomScramble(25);
    assert.equal(scramble.length, 25);

    let prevBase = "";
    for (const move of scramble) {
      const base = move[0];
      assert.notEqual(base, prevBase);
      prevBase = base;
    }

    let cubies = generateInitialCubies();
    for (const moveStr of scramble) {
      const parsed = parseSingmasterMove(moveStr);
      if (parsed) {
        cubies = applyMoveToCubies(cubies, parsed.axis, parsed.layer, parsed.angle);
      }
    }
    const facelets = extractFacelets54(cubies);
    const evalState = evaluateCubeState(facelets, scramble);
    assert.equal(evalState.isSolved, false);
    assert.ok(evalState.entropy > 0);
  });
});
