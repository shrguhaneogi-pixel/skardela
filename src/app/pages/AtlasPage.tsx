import { useState } from "react";
import { formatDuration } from "../../shared/completion";
import {
  clearAtlasData,
  loadCurrentAtlasStats,
  setAtlasEnabled,
  type LogicAtlasStats,
  type LogicSkill,
} from "../../shared/logic-atlas";
import { text } from "../../text/en";
import { symbols } from "../../text/symbols";
import { AtlasConstellationChart } from "../../shared/AtlasConstellationChart";
import { Badge } from "../../shared/ui/Badge";
import { Button } from "../../shared/ui/Button";
import styles from "./AtlasPage.module.css";

// ASD-STE100 Simplified Technical English comments.
// This component renders the Personal Logic Atlas page.

type MetricsGridProps = {
  stats: LogicAtlasStats;
};

function AtlasMetricsGrid({ stats }: MetricsGridProps) {
  const sym = symbols.atlas;
  return (
    <div className={styles.metricsGrid}>
      <div className={`sk-surface-card ${styles.metricCard}`}>
        <div className={styles.metricHeader}>
          <span>{sym.solved}</span>
          <span>{text.atlas.totalSolved}</span>
        </div>
        <span className={styles.metricValue}>{stats.totalSolved}</span>
      </div>
      <div className={`sk-surface-card ${styles.metricCard}`}>
        <div className={styles.metricHeader}>
          <span>{sym.clean}</span>
          <span>{text.atlas.cleanSolves}</span>
        </div>
        <span className={styles.metricValue}>{stats.cleanSolves}</span>
      </div>
      <div className={`sk-surface-card ${styles.metricCard}`}>
        <div className={styles.metricHeader}>
          <span>{sym.streak}</span>
          <span>{text.atlas.currentStreak}</span>
        </div>
        <span className={styles.metricValue}>{text.atlas.streakDays(stats.currentStreak)}</span>
      </div>
      <div className={`sk-surface-card ${styles.metricCard}`}>
        <div className={styles.metricHeader}>
          <span>{sym.time}</span>
          <span>{text.atlas.totalTime}</span>
        </div>
        <span className={styles.metricValue}>{formatDuration(stats.totalTimeSeconds)}</span>
      </div>
    </div>
  );
}

type SkillsSectionProps = {
  skills: LogicSkill[];
};

function AtlasSkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="skills-heading">
      <h2 id="skills-heading" className="sk-section-title mb-4">
        {text.atlas.skillsHeading}
      </h2>
      <AtlasConstellationChart skills={skills} />
      <ul className={styles.skillsList}>
        {skills.map((skill) => (
          <li
            key={skill.id}
            className={`sk-surface-card sk-surface-card-interactive ${styles.skillCard}`}
          >
            <div className={styles.skillHeader}>
              <h3 className={styles.skillName}>{skill.name}</h3>
              <Badge variant="accent">{`${skill.proficiencyPercent}%`}</Badge>
            </div>
            <p className={styles.skillDesc}>{skill.description}</p>
            <progress
              className="sk-progress"
              value={skill.proficiencyPercent}
              max={100}
              aria-label={skill.name}
            >
              {`${skill.proficiencyPercent}%`}
            </progress>
          </li>
        ))}
      </ul>
    </section>
  );
}

type SettingsSectionProps = {
  isEnabled: boolean;
  onToggleEnabled: () => void;
  onClearHistory: () => void;
  feedback: string | null;
};

function AtlasSettingsSection(props: SettingsSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="settings-heading">
      <h2 id="settings-heading" className="sk-section-title mb-4">
        {text.atlas.settingsHeading}
      </h2>
      <div className={`sk-surface-card ${styles.settingsCard}`}>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <h3>{text.atlas.enableLabel}</h3>
            <p>{text.atlas.enableHelp}</p>
          </div>
          <input
            type="checkbox"
            checked={props.isEnabled}
            onChange={props.onToggleEnabled}
            aria-label={text.atlas.enableLabel}
          />
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <h3>{text.atlas.clearHistoryBtn}</h3>
            {props.feedback && <span className={styles.feedbackMsg}>{props.feedback}</span>}
          </div>
          <Button variant="destructive" onClick={props.onClearHistory}>
            {text.atlas.clearHistoryBtn}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function AtlasPage() {
  const [stats, setStats] = useState<LogicAtlasStats>(() => loadCurrentAtlasStats());
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggle = () => {
    const next = !stats.isEnabled;
    setAtlasEnabled(next);
    setStats(loadCurrentAtlasStats());
  };

  const handleClear = () => {
    if (window.confirm(text.atlas.clearConfirm)) {
      clearAtlasData();
      setStats(loadCurrentAtlasStats());
      setFeedback(text.atlas.historyCleared);
    }
  };

  return (
    <>
      <title>{`${text.atlas.title} | ${text.siteName}`}</title>
      <div className="sk-hero">
        <h1 data-testid="atlas-page-title">{text.atlas.title}</h1>
        <p className="sk-intro">{text.atlas.intro}</p>
        <aside className="sk-disclaimer" aria-label={text.atlas.disclaimer}>
          {text.atlas.disclaimer}
        </aside>
      </div>

      {stats.isEnabled ? (
        <>
          <AtlasMetricsGrid stats={stats} />
          <AtlasSkillsSection skills={stats.skills} />
        </>
      ) : (
        <p className="sk-intro">{text.atlas.disabledMessage}</p>
      )}

      <AtlasSettingsSection
        isEnabled={stats.isEnabled}
        onToggleEnabled={handleToggle}
        onClearHistory={handleClear}
        feedback={feedback}
      />
    </>
  );
}
