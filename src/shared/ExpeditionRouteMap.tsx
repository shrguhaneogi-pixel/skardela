// ASD-STE100 Simplified Technical English comments.
// This component renders an SVG journey route map for an expedition chapter.

import type { ExpeditionStage, StageState } from "./expeditions";
import styles from "./ExpeditionRouteMap.module.css";

type RouteProps = {
  stages: readonly ExpeditionStage[];
  statusMap: Map<string, StageState>;
};

type SegmentsProps = {
  stages: readonly ExpeditionStage[];
  statusMap: Map<string, StageState>;
  paddingX: number;
  step: number;
  cy: number;
};

function RouteSegments({ stages, statusMap, paddingX, step, cy }: SegmentsProps) {
  const count = stages.length;
  return stages.slice(0, count - 1).map((stage, idx) => {
    const currentStatus = statusMap.get(stage.id) ?? "locked";
    const nextStage = stages[idx + 1];
    const nextStatus = nextStage ? (statusMap.get(nextStage.id) ?? "locked") : "locked";
    const x1 = paddingX + idx * step;
    const x2 = paddingX + (idx + 1) * step;

    const isCompleted = currentStatus === "completed" && nextStatus !== "locked";
    const isActive = currentStatus === "completed" && nextStatus === "available";

    const segmentClass = isCompleted
      ? styles.trailCompleted
      : isActive
        ? styles.trailActive
        : styles.trailLine;

    const segKey = `seg-${stage.id}-${nextStage?.id ?? "end"}`;
    return <line key={segKey} x1={x1} y1={cy} x2={x2} y2={cy} className={segmentClass} />;
  });
}

function RouteWaypoints({ stages, statusMap, paddingX, step, cy }: SegmentsProps) {
  return stages.map((stage, idx) => {
    const status = statusMap.get(stage.id) ?? "locked";
    const cx = paddingX + idx * step;
    const nodeClass =
      status === "completed"
        ? styles.waypointCompleted
        : status === "available"
          ? styles.waypointAvailable
          : styles.waypointLocked;
    const r = status === "available" ? 6 : 5;

    return <circle key={stage.id} cx={cx} cy={cy} r={r} className={nodeClass} />;
  });
}

export function ExpeditionRouteMap({ stages, statusMap }: RouteProps) {
  const count = stages.length;
  if (count <= 1) return null;

  const width = 360;
  const height = 44;
  const paddingX = 24;
  const step = (width - paddingX * 2) / (count - 1);
  const cy = height / 2;
  const sharedProps = { stages, statusMap, paddingX, step, cy };

  return (
    <div className={styles.routeMapWrapper} aria-hidden="true">
      <svg
        className={styles.routeSvg}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <line x1={paddingX} y1={cy} x2={width - paddingX} y2={cy} className={styles.trailLine} />
        <RouteSegments {...sharedProps} />
        <RouteWaypoints {...sharedProps} />
      </svg>
    </div>
  );
}
