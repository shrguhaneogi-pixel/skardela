/* oxlint-disable import/max-dependencies, eslint/max-lines-per-function */
import { useState, type ChangeEvent } from "react";
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
import { saveFile } from "../../shared/save-file";
import { parseImportText, toExportText } from "../../shared/state/storage-format";
import { pickSavedData } from "../../shared/state/saved-data";
import { useAppStore } from "../../shared/state/store";
import styles from "./AtlasPage.module.css";

// ASD-STE100 Simplified Technical English comments.
// This component renders the Personal Logic Atlas page.

function exportAtlasBackup(): void {
  const data = pickSavedData(useAppStore.getState());
  const exportText = toExportText(data, new Date());
  saveFile("skardela-backup.json", exportText);
}

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
  onExportData: () => void;
  onImportFile: (event: ChangeEvent<HTMLInputElement>) => void;
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
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={props.isEnabled}
              onChange={props.onToggleEnabled}
              aria-label={text.atlas.enableLabel}
            />
          </label>
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <h3>{text.atlas.exportDataBtn}</h3>
            <p>Download a backup file of your solved puzzles and stats.</p>
          </div>
          <Button variant="secondary" onClick={props.onExportData}>
            {text.atlas.exportDataBtn}
          </Button>
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <h3>{text.atlas.importDataBtn}</h3>
            <p>Restore your solves from a backup file or a different browser.</p>
          </div>
          <label className="inline-flex items-center">
            <span className="visually-hidden">{text.atlas.importDataBtn}</span>
            <input
              type="file"
              accept=".json,.skardela"
              onChange={props.onImportFile}
              className="text-xs text-stone-600 dark:text-stone-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-500/10 file:text-orange-600 hover:file:bg-orange-500/20 cursor-pointer"
            />
          </label>
        </div>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <h3>{text.atlas.clearHistoryBtn}</h3>
            {props.feedback && (
              <output aria-live="polite" className={styles.feedbackMsg}>
                {props.feedback}
              </output>
            )}
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

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      const parsed = parseImportText(content);
      if (parsed) {
        const added = useAppStore.getState().importData(parsed);
        setStats(loadCurrentAtlasStats());
        setFeedback(text.atlas.importSuccess(added));
      } else {
        setFeedback(text.atlas.importFailed);
      }
    } catch {
      setFeedback(text.atlas.importFailed);
    }
    event.target.value = "";
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
        onExportData={exportAtlasBackup}
        onImportFile={handleImport}
        feedback={feedback}
      />
    </>
  );
}
