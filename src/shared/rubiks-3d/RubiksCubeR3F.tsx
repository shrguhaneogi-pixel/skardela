// ASD-STE100 Simplified Technical English comments.
// Production-grade React Three Fiber 3D Rubik's Cube component for Next.js 16 App Router.
// Interactive purely through spatial mouse drag vectors. Tightly synchronized with LLM context.

"use client";

import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  evaluateDragKinematics,
  snapToCardinalNormal,
  createVec3,
  type Vec3,
  cleanCubiePosition,
  snapQuaternionToOrtho,
  identifySliceIndices,
} from "./math.ts";
import {
  createSpringState,
  stepSpring,
  computeSnapAngle,
  VelocityTracker,
  DEFAULT_SPRING_CONFIG,
  type SpringState,
} from "./spring.ts";
import {
  generateInitialCubies,
  extractFacelets54,
  evaluateCubeState,
  getSingmasterMove,
  CUBE_PALETTE,
  CORE_BODY_COLOR,
  type CubieData,
  type CubeLLMContext,
  type FaceName,
} from "./state.ts";

export interface RubiksCubeR3FProps {
  onContextUpdate?: (context: CubeLLMContext) => void;
  scrambleMoves?: string[];
  autoRotate?: boolean;
}

interface DragKinematicsState {
  active: boolean;
  isLocked: boolean;
  startScreenX: number;
  startScreenY: number;
  hitPointWorld: THREE.Vector3;
  faceNormalWorld: THREE.Vector3;
  clickedCubieIndex: number;
  rotationAxis: THREE.Vector3 | null;
  screenTangent: { x: number; y: number } | null;
  rotatingSliceMeshes: THREE.Mesh[];
  rotationSign: number;
}

const CUBIE_SIZE = 0.94;
const STICKER_OFFSET = 0.476;
const STICKER_SIZE = 0.84;

// Individual 3D Cubie with tactile bevels and colored facelet stickers.
export const CubieMesh = React.memo(function CubieMesh({
  cubie,
  onPointerDownCubie,
  registerMeshRef,
}: {
  cubie: CubieData;
  onPointerDownCubie: (e: ThreeEvent<PointerEvent>, cubieIndex: number) => void;
  registerMeshRef: (el: THREE.Mesh | null, index: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh | null>(null);

  const setRefs = useCallback(
    (el: THREE.Mesh | null) => {
      meshRef.current = el;
      registerMeshRef(el, cubie.index);
    },
    [cubie.index, registerMeshRef],
  );

  const initPos = cubie.initialPosition;

  // Render sticker planes only on exterior faces.
  const stickers = useMemo(() => {
    const list: { face: FaceName; position: [number, number, number]; rotation: [number, number, number] }[] = [];
    if (initPos.y === 1) list.push({ face: "U", position: [0, STICKER_OFFSET, 0], rotation: [-Math.PI / 2, 0, 0] });
    if (initPos.y === -1) list.push({ face: "D", position: [0, -STICKER_OFFSET, 0], rotation: [Math.PI / 2, 0, 0] });
    if (initPos.x === 1) list.push({ face: "R", position: [STICKER_OFFSET, 0, 0], rotation: [0, Math.PI / 2, 0] });
    if (initPos.x === -1) list.push({ face: "L", position: [-STICKER_OFFSET, 0, 0], rotation: [0, -Math.PI / 2, 0] });
    if (initPos.z === 1) list.push({ face: "F", position: [0, 0, STICKER_OFFSET], rotation: [0, 0, 0] });
    if (initPos.z === -1) list.push({ face: "B", position: [0, 0, -STICKER_OFFSET], rotation: [0, Math.PI, 0] });
    return list;
  }, [initPos]);

  return (
    <mesh
      ref={setRefs}
      position={[initPos.x, initPos.y, initPos.z]}
      castShadow
      receiveShadow
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDownCubie(e, cubie.index);
      }}
    >
      <boxGeometry args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} />
      <meshStandardMaterial
        color={CORE_BODY_COLOR}
        roughness={0.4}
        metalness={0.2}
      />
      {stickers.map((s, idx) => (
        <mesh key={idx} position={s.position} rotation={s.rotation}>
          <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
          <meshStandardMaterial
            color={CUBE_PALETTE[s.face].hex}
            roughness={0.15}
            metalness={0.1}
          />
        </mesh>
      ))}
    </mesh>
  );
});

// Main 3D Scene containing the cube hierarchy, pivot group, and kinematics loop.
export function RubiksCubeScene({
  onContextUpdate,
}: {
  onContextUpdate?: (context: CubeLLMContext) => void;
}) {
  const { camera, gl } = useThree();
  const cubeRootRef = useRef<THREE.Group>(null);
  const pivotGroupRef = useRef<THREE.Group>(new THREE.Group());
  const cubieMeshesRef = useRef<(THREE.Mesh | null)[]>([]);

  const initialCubies = useMemo(() => generateInitialCubies(), []);
  const velocityTrackerRef = useRef(new VelocityTracker());

  const [spring, setSpring] = useState<SpringState>(() => createSpringState(0));
  const moveHistoryRef = useRef<string[]>([]);

  // Imperative kinematic drag state.
  const dragRef = useRef<DragKinematicsState>({
    active: false,
    isLocked: false,
    startScreenX: 0,
    startScreenY: 0,
    hitPointWorld: new THREE.Vector3(),
    faceNormalWorld: new THREE.Vector3(),
    clickedCubieIndex: -1,
    rotationAxis: null,
    screenTangent: null,
    rotatingSliceMeshes: [],
    rotationSign: 1,
  });

  const registerMeshRef = useCallback((el: THREE.Mesh | null, index: number) => {
    cubieMeshesRef.current[index] = el;
  }, []);

  // Ensure pivot group is attached to the cube root on mount.
  useEffect(() => {
    const root = cubeRootRef.current;
    const pivot = pivotGroupRef.current;
    if (root && pivot && pivot.parent !== root) {
      root.add(pivot);
    }
  }, []);

  // Handle pointer down on an individual cubie.
  const handlePointerDownCubie = useCallback(
    (e: ThreeEvent<PointerEvent>, cubieIndex: number) => {
      // If animation is still running, block new drag until settled.
      if (!spring.isSettled) return;

      const hit = e.intersections[0];
      if (!hit || !hit.face) return;

      const cubieMesh = cubieMeshesRef.current[cubieIndex];
      if (!cubieMesh) return;

      // Calculate world face normal.
      const worldNormal = hit.face.normal
        .clone()
        .transformDirection(cubieMesh.matrixWorld)
        .normalize();

      dragRef.current = {
        active: true,
        isLocked: false,
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        hitPointWorld: hit.point.clone(),
        faceNormalWorld: worldNormal,
        clickedCubieIndex: cubieIndex,
        rotationAxis: null,
        screenTangent: null,
        rotatingSliceMeshes: [],
        rotationSign: 1,
      };

      velocityTrackerRef.current.reset(0, performance.now());
    },
    [spring.isSettled],
  );

  // Handle pointer move over the canvas for buttonless spatial dragging.
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.active) return;

      const deltaX = e.clientX - drag.startScreenX;
      const deltaY = e.clientY - drag.startScreenY;
      const dragDist = Math.hypot(deltaX, deltaY);

      // Lock rotation axis once threshold is passed.
      if (!drag.isLocked && dragDist >= 8) {
        camera.updateMatrixWorld();
        const viewProj = camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse);

        const viewWidth = gl.domElement.clientWidth || 800;
        const viewHeight = gl.domElement.clientHeight || 600;

        const kin = evaluateDragKinematics(
          createVec3(drag.hitPointWorld.x, drag.hitPointWorld.y, drag.hitPointWorld.z),
          createVec3(drag.faceNormalWorld.x, drag.faceNormalWorld.y, drag.faceNormalWorld.z),
          { x: deltaX, y: deltaY },
          { elements: viewProj.elements },
          viewWidth,
          viewHeight,
          8,
        );

        if (kin.isLocked && kin.selectedAxis && kin.selectedScreenTangent) {
          const threeAxis = new THREE.Vector3(
            kin.selectedAxis.x,
            kin.selectedAxis.y,
            kin.selectedAxis.z,
          ).normalize();

          const clickedMesh = cubieMeshesRef.current[drag.clickedCubieIndex];
          if (!clickedMesh) return;

          const positions = cubieMeshesRef.current.map((m) => {
            if (!m) return createVec3();
            const wp = new THREE.Vector3();
            m.getWorldPosition(wp);
            return createVec3(wp.x, wp.y, wp.z);
          });
          const sliceIndices = identifySliceIndices(positions, drag.clickedCubieIndex, kin.selectedAxis);
          const sliceMeshes = sliceIndices
            .map((idx) => cubieMeshesRef.current[idx])
            .filter((m): m is THREE.Mesh => m !== null);

          // Reset pivot transform and dynamically attach slice meshes.
          const pivot = pivotGroupRef.current;
          pivot.rotation.set(0, 0, 0);
          pivot.position.set(0, 0, 0);
          pivot.updateMatrixWorld(true);

          for (const mesh of sliceMeshes) {
            pivot.attach(mesh);
          }

          drag.isLocked = true;
          drag.rotationAxis = threeAxis;
          drag.screenTangent = kin.selectedScreenTangent;
          drag.rotatingSliceMeshes = sliceMeshes;
          drag.rotationSign = kin.rotationSign;
        }
      }

      // Update rotation angle during drag.
      if (drag.isLocked && drag.rotationAxis && drag.screenTangent) {
        const dragPixels = deltaX * drag.screenTangent.x + deltaY * drag.screenTangent.y;
        const angle = dragPixels * 0.008;
        velocityTrackerRef.current.update(angle, performance.now());

        // Update pivot rotation directly along axis.
        pivotGroupRef.current.setRotationFromAxisAngle(drag.rotationAxis, angle);
        setSpring((prev) => ({ ...prev, position: angle, isSettled: true }));
      }
    },
    [camera, gl],
  );

  // Handle pointer release to spring-snap and bake matrices.
  const handlePointerUp = useCallback(() => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;

    if (!drag.isLocked || !drag.rotationAxis) {
      dragRef.current = {
        ...dragRef.current,
        active: false,
        isLocked: false,
        rotationAxis: null,
        screenTangent: null,
        rotatingSliceMeshes: [],
      };
      return;
    }

    const currentAngle = spring.position;
    const releaseVelocity = velocityTrackerRef.current.getVelocity();
    const snapTarget = computeSnapAngle(currentAngle, releaseVelocity, DEFAULT_SPRING_CONFIG);

    setSpring({
      position: currentAngle,
      velocity: releaseVelocity,
      target: snapTarget,
      isSettled: false,
    });
  }, [spring.position]);

  // Animation frame loop: steps spring physics and bakes matrices on settling.
  useFrame((_, delta) => {
    if (spring.isSettled) return;

    const drag = dragRef.current;
    if (!drag.rotationAxis) return;

    const nextSpring = stepSpring(spring, delta, DEFAULT_SPRING_CONFIG);
    setSpring(nextSpring);

    // Apply rotation to pivot group.
    pivotGroupRef.current.setRotationFromAxisAngle(drag.rotationAxis, nextSpring.position);

    // Check if snap animation settled this frame.
    if (nextSpring.isSettled) {
      const cubeRoot = cubeRootRef.current;
      const pivot = pivotGroupRef.current;
      if (!cubeRoot) return;

      // Re-attach slice meshes to root and clean coordinates.
      for (const mesh of drag.rotatingSliceMeshes) {
        mesh.updateMatrixWorld(true);
        cubeRoot.attach(mesh);

        // Snap positions to exact integers to eliminate numerical drift.
        mesh.position.x = Math.round(mesh.position.x);
        mesh.position.y = Math.round(mesh.position.y);
        mesh.position.z = Math.round(mesh.position.z);

        // Snap quaternion to nearest orthogonal orientation.
        const cleanQuat = snapQuaternionToOrtho({
          x: mesh.quaternion.x,
          y: mesh.quaternion.y,
          z: mesh.quaternion.z,
          w: mesh.quaternion.w,
        });
        mesh.quaternion.set(cleanQuat.x, cleanQuat.y, cleanQuat.z, cleanQuat.w);
        mesh.updateMatrix();
      }

      // Reset pivot orientation.
      pivot.rotation.set(0, 0, 0);
      pivot.updateMatrixWorld(true);

      // Record move in Singmaster notation.
      const clickedPos = new THREE.Vector3();
      const clickedMesh = cubieMeshesRef.current[drag.clickedCubieIndex];
      if (clickedMesh) {
        clickedMesh.getWorldPosition(clickedPos);
        const layerCoord = Math.round(clickedPos.dot(drag.rotationAxis));
        const moveName = getSingmasterMove(
          createVec3(drag.rotationAxis.x, drag.rotationAxis.y, drag.rotationAxis.z),
          layerCoord,
          nextSpring.target,
        );

        if (moveName) {
          moveHistoryRef.current.push(moveName);
        }

        // Build cubie data snapshot for LLM context evaluation.
        const currentCubies: CubieData[] = initialCubies.map((c) => {
          const mesh = cubieMeshesRef.current[c.index];
          if (!mesh) return c;
          return {
            ...c,
            currentPosition: createVec3(mesh.position.x, mesh.position.y, mesh.position.z),
            quaternion: {
              x: mesh.quaternion.x,
              y: mesh.quaternion.y,
              z: mesh.quaternion.z,
              w: mesh.quaternion.w,
            },
          };
        });

        const facelets = extractFacelets54(currentCubies);
        const context = evaluateCubeState(facelets, moveHistoryRef.current, moveName || null);

        if (onContextUpdate) {
          onContextUpdate(context);
        }
      }

      // Reset drag kinematics.
      dragRef.current = {
        active: false,
        isLocked: false,
        startScreenX: 0,
        startScreenY: 0,
        hitPointWorld: new THREE.Vector3(),
        faceNormalWorld: new THREE.Vector3(),
        clickedCubieIndex: -1,
        rotationAxis: null,
        screenTangent: null,
        rotatingSliceMeshes: [],
        rotationSign: 1,
      };
    }
  });

  return (
    <group
      ref={cubeRootRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <primitive object={pivotGroupRef.current} />
      {initialCubies.map((cubie) => (
        <CubieMesh
          key={cubie.index}
          cubie={cubie}
          onPointerDownCubie={handlePointerDownCubie}
          registerMeshRef={registerMeshRef}
        />
      ))}
    </group>
  );
}

// Next.js 16 App Router export with declarative Canvas and lighting.
export default function RubiksCubeR3F({
  onContextUpdate,
}: RubiksCubeR3FProps) {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: "480px", position: "relative" }}>
      <Canvas
        camera={{ position: [4.2, 3.8, 5.2], fov: 42 }}
        shadows="percentage"
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#0c0d12"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 12, 8]} intensity={1.8} castShadow />
        <directionalLight position={[-8, -6, -8]} intensity={0.5} />
        <RubiksCubeScene onContextUpdate={onContextUpdate} />
      </Canvas>
    </div>
  );
}
