import type { ChangeEvent } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import { text } from "../../text/en";
import { getPuzzleProgressStatus } from "../../shared/puzzle-progress";
import { formatDateString, type LocalDate } from "../daily";
import { EditorialPuzzleDiagram } from "../../shared/EditorialPuzzleDiagram";
import {
  getArchiveDateRange,
  getRecentArchiveDates,
  type ArchiveDayData,
  type ArchiveTypeGroup,
} from "../archive";
import styles from "./ArchivePage.module.css";

// ASD-STE100 Simplified Technical English comments.
// This component renders the historical daily puzzle archive page.

type RecentProps = { dates: LocalDate[]; currentDateString: string };

function RecentDateList({ dates, currentDateString }: RecentProps) {
  return (
    <nav className={styles.recentContainer} aria-label={text.archive.recentHeading}>
      <h2 className={styles.recentLabel}>{text.archive.recentHeading}</h2>
      <ul className={styles.recentList}>
        {dates.map((date) => {
          const str = formatDateString(date);
          const isActive = str === currentDateString;
          return (
            <li key={str} className={styles.recentItem}>
              <Link
                to={`/archive/${str}`}
                className={styles.recentLink}
                data-active={isActive}
                aria-current={isActive ? "page" : undefined}
              >
                {str}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type DateBarProps = {
  currentDateString: string;
  isToday: boolean;
  minDate: string;
  maxDate: string;
  onDateChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function DateBar(props: DateBarProps) {
  return (
    <div className={styles.dateBar}>
      <div className={styles.pickerGroup}>
        <label htmlFor="archive-date-picker" className={styles.pickerLabel}>
          {text.archive.datePickerLabel}
        </label>
        <input
          id="archive-date-picker"
          type="date"
          className={styles.dateInput}
          min={props.minDate}
          max={props.maxDate}
          value={props.currentDateString}
          onChange={props.onDateChange}
        />
      </div>
      {!props.isToday && (
        <Link to="/archive" className={styles.todayBtn}>
          {text.archive.jumpToToday} →
        </Link>
      )}
    </div>
  );
}

type ItemProps = { id: string; difficulty: keyof typeof text.levels; dateString: string };

function ArchiveLevelItem({ id, difficulty, dateString }: ItemProps) {
  const status = getPuzzleProgressStatus(id);
  return (
    <li className={styles.levelItem}>
      <Link className={styles.play} to={`/puzzles/${id}?date=${dateString}`}>
        {text.levels[difficulty]}
      </Link>
      {status === "solved" && <span className={styles.statusPillSolved}>{text.home.solved} ✓</span>}
      {status === "in_progress" && (
        <span className={styles.statusPillResume}>{text.home.resume} ⏱</span>
      )}
    </li>
  );
}

type CardProps = { group: ArchiveTypeGroup; dateString: string };

function ArchiveCard({ group, dateString }: CardProps) {
  const puzzleTypeText = text[group.type];
  return (
    <li className={styles.card}>
      <div className={styles.cardHeader}>
        <EditorialPuzzleDiagram type={group.type} levels={group.levels} />
        <div>
          <h3 className={styles.cardTitle}>{puzzleTypeText.name}</h3>
          <span className={styles.cardTag}>{puzzleTypeText.tag}</span>
        </div>
      </div>
      <p className={styles.summary}>{puzzleTypeText.summary}</p>
      <nav aria-label={text.home.levelsHeading(puzzleTypeText.name)}>
        <ul className={styles.levels}>
          {group.levels.map(({ id, difficulty }) => (
            <ArchiveLevelItem key={id} id={id} difficulty={difficulty} dateString={dateString} />
          ))}
        </ul>
      </nav>
    </li>
  );
}

export function ArchivePage() {
  const data = useLoaderData<ArchiveDayData>();
  const navigate = useNavigate();
  const recentDates = getRecentArchiveDates(14);
  const range = getArchiveDateRange();

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      navigate(`/archive/${e.target.value}`);
    }
  };

  const badgeText = data.isToday
    ? `${text.archive.todayBadge} • ${data.dateString} UTC`
    : `${text.archive.archiveBadge(data.dateString)}`;

  return (
    <>
      <title>{`${text.archive.title} | ${text.siteName}`}</title>
      <div className={styles.hero}>
        <h1 data-testid="archive-page-title">{text.archive.title}</h1>
        <p className={styles.intro}>{text.archive.intro}</p>
        <DateBar
          currentDateString={data.dateString}
          isToday={data.isToday}
          minDate={range.minDate}
          maxDate={range.maxDate}
          onDateChange={handleDateChange}
        />
        <RecentDateList dates={recentDates} currentDateString={data.dateString} />
      </div>

      <section className={styles.section} aria-labelledby="archive-puzzles-heading">
        <header className={styles.statusHeader}>
          <span className={styles.challengeBadge} data-today={data.isToday}>
            {badgeText}
          </span>
          <h2 id="archive-puzzles-heading" className="visually-hidden">
            {text.archive.selectedDateHeading(data.dateString)}
          </h2>
        </header>
        <ul className={styles.list}>
          {data.types.map((group) => (
            <ArchiveCard key={group.type} group={group} dateString={data.dateString} />
          ))}
        </ul>
      </section>
    </>
  );
}
