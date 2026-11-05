// ASD-STE100 Simplified Technical English comments.
// Raycasting and spatial mouse hit detection for Rubik's Cube components.

import { addVec3, createVec3, crossVec3, normalizeVec3, subVec3, type Vec3 } from "./math.ts";
import type { CubieData } from "./state.ts";

export interface RayHit {
  cubieIndex: number;
  normal: Vec3;
  hitPoint: Vec3;
}

export function computeCameraEye(yaw: number, pitch: number): Vec3 {
  return createVec3(
    6.2 * Math.cos(yaw) * Math.cos(pitch),
    6.2 * Math.sin(pitch),
    6.2 * Math.sin(yaw) * Math.cos(pitch),
  );
}

export function computeRayDir(
  screenX: number,
  screenY: number,
  width: number,
  height: number,
  eye: Vec3,
): Vec3 {
  const ndcX = (screenX / width) * 2.0 - 1.0;
  const ndcY = 1.0 - (screenY / height) * 2.0;

  const forward = normalizeVec3(subVec3(createVec3(0, 0, 0), eye));
  const right = normalizeVec3(crossVec3(forward, createVec3(0, 1, 0)));
  const up = normalizeVec3(crossVec3(right, forward));

  const aspect = width / height;
  const tanFov = Math.tan((Math.PI / 4) * 0.5);

  return normalizeVec3({
    x: forward.x + right.x * ndcX * tanFov * aspect + up.x * ndcY * tanFov,
    y: forward.y + right.y * ndcX * tanFov * aspect + up.y * ndcY * tanFov,
    z: forward.z + right.z * ndcX * tanFov * aspect + up.z * ndcY * tanFov,
  });
}

function intersectCubieSlab(
  cubiePos: Vec3,
  eye: Vec3,
  rayDir: Vec3,
): { tmin: number; normal: Vec3 } | null {
  const min = { x: cubiePos.x - 0.48, y: cubiePos.y - 0.48, z: cubiePos.z - 0.48 };
  const max = { x: cubiePos.x + 0.48, y: cubiePos.y + 0.48, z: cubiePos.z + 0.48 };

  const t1 = (min.x - eye.x) / (rayDir.x || 1e-6);
  const t2 = (max.x - eye.x) / (rayDir.x || 1e-6);
  const t3 = (min.y - eye.y) / (rayDir.y || 1e-6);
  const t4 = (max.y - eye.y) / (rayDir.y || 1e-6);
  const t5 = (min.z - eye.z) / (rayDir.z || 1e-6);
  const t6 = (max.z - eye.z) / (rayDir.z || 1e-6);

  const tminX = Math.min(t1, t2);
  const tmaxX = Math.max(t1, t2);
  const tminY = Math.min(t3, t4);
  const tmaxY = Math.max(t3, t4);
  const tminZ = Math.min(t5, t6);
  const tmaxZ = Math.max(t5, t6);

  const tmin = Math.max(tminX, tminY, tminZ);
  const tmax = Math.min(tmaxX, tmaxY, tmaxZ);

  if (tmax < tmin || tmin <= 0) return null;

  let norm: Vec3;
  if (tmin === tminX) {
    norm = { x: rayDir.x < 0 ? 1 : -1, y: 0, z: 0 };
  } else if (tmin === tminY) {
    norm = { x: 0, y: rayDir.y < 0 ? 1 : -1, z: 0 };
  } else {
    norm = { x: 0, y: 0, z: rayDir.z < 0 ? 1 : -1 };
  }

  return { tmin, normal: norm };
}

export function pickCubie(
  screenX: number,
  screenY: number,
  width: number,
  height: number,
  eye: Vec3,
  cubies: CubieData[],
): RayHit | null {
  const rayDir = computeRayDir(screenX, screenY, width, height, eye);

  let bestDist = Infinity;
  let bestCubieIndex = -1;
  let bestNormal = createVec3(0, 1, 0);

  for (let i = 0; i < cubies.length; i++) {
    const cubie = cubies[i];
    if (!cubie) continue;

    const hit = intersectCubieSlab(cubie.currentPosition, eye, rayDir);
    if (!hit || hit.tmin >= bestDist) continue;

    const outer = addVec3(cubie.currentPosition, hit.normal);
    if (Math.abs(outer.x) > 1.2 || Math.abs(outer.y) > 1.2 || Math.abs(outer.z) > 1.2) {
      bestDist = hit.tmin;
      bestCubieIndex = i;
      bestNormal = hit.normal;
    }
  }

  if (bestCubieIndex < 0) return null;

  return {
    cubieIndex: bestCubieIndex,
    normal: bestNormal,
    hitPoint: {
      x: eye.x + rayDir.x * bestDist,
      y: eye.y + rayDir.y * bestDist,
      z: eye.z + rayDir.z * bestDist,
    },
  };
}
