// ASD-STE100 Simplified Technical English comments.
// This component renders an SVG radar constellation diagram for Personal Logic Atlas skills.

import { useMemo } from "react";
import type { LogicSkill } from "./logic-atlas";
import { text } from "../text/en";
import styles from "./AtlasConstellationChart.module.css";

type ChartProps = {
  skills: LogicSkill[];
};

type Point = { x: number; y: number };

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleDeg: number,
): Point {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY + radius * Math.sin(rad),
  };
}

function WebCircles({ center, maxR }: { center: number; maxR: number }) {
  const levels = [0.25, 0.5, 0.75, 1.0];
  return levels.map((lvl) => {
    const r = maxR * lvl;
    return <circle key={lvl} cx={center} cy={center} r={r} className={styles.gridWeb} />;
  });
}

function SkillAxes({ center, maxR, count }: { center: number; maxR: number; count: number }) {
  const numAxes = Math.max(3, count);
  const angles = Array.from({ length: numAxes }, (_, i) => (i / numAxes) * 360);
  return angles.map((angle) => {
    const pt = polarToCartesian(center, center, maxR, angle);
    return (
      <line key={angle} x1={center} y1={center} x2={pt.x} y2={pt.y} className={styles.gridAxis} />
    );
  });
}

function SkillVertices({
  center,
  maxR,
  skills,
}: {
  center: number;
  maxR: number;
  skills: LogicSkill[];
}) {
  const count = skills.length;
  return skills.map((skill, idx) => {
    const angle = count > 0 ? (idx / count) * 360 : 0;
    const r = Math.max(12, maxR * (skill.proficiencyPercent / 100));
    const pt = polarToCartesian(center, center, r, angle);
    const labelPt = polarToCartesian(center, center, maxR + 18, angle);
    return (
      <g key={skill.id}>
        <circle cx={pt.x} cy={pt.y} r={4.5} className={styles.skillVertex} />
        <text x={labelPt.x} y={labelPt.y - 6} className={styles.labelAxis}>
          {skill.name}
        </text>
        <text x={labelPt.x} y={labelPt.y + 6} className={styles.labelValue}>
          {`${skill.proficiencyPercent}%`}
        </text>
      </g>
    );
  });
}

const CENTER = 150;
const MAX_R = 90;

export function AtlasConstellationChart({ skills }: ChartProps) {
  const polygonPath = useMemo(() => {
    if (skills.length === 0) return "";
    const count = skills.length;
    const points = skills.map((s, idx) => {
      const angle = (idx / count) * 360;
      const r = Math.max(12, MAX_R * (s.proficiencyPercent / 100));
      return polarToCartesian(CENTER, CENTER, r, angle);
    });
    return `${points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")} Z`;
  }, [skills]);

  return (
    <div className={styles.chartCard}>
      <svg
        className={styles.chartSvg}
        viewBox="0 0 300 300"
        aria-label={text.atlas.constellationAria}
      >
        <title>{text.atlas.constellationAria}</title>
        <WebCircles center={CENTER} maxR={MAX_R} />
        <SkillAxes center={CENTER} maxR={MAX_R} count={skills.length} />
        {polygonPath && <path d={polygonPath} className={styles.polygonShape} />}
        <SkillVertices center={CENTER} maxR={MAX_R} skills={skills} />
      </svg>
    </div>
  );
}
