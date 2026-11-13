/* oxlint-disable import/max-dependencies */
import { Link, NavLink, Outlet } from "react-router";
import { text } from "../text/en";
import { symbols } from "../text/symbols";
import { MotionProvider } from "../shared/MotionProvider";
import { ReactiveCursor } from "../shared/ReactiveCursor";
import { useSmoothScroll } from "../shared/useSmoothScroll";
import { cn } from "../shared/utils";
import { currentStreak } from "../shared/state/progress";
import { useAppStore } from "../shared/state/store";
import { useToday } from "../shared/useNow";
import { useReloadAtMidnight } from "./useReloadAtMidnight";
import styles from "./Layout.module.css";
import { ThemeSwitcher } from "./ThemeSwitcher";

// ASD-STE100 Simplified Technical English comments.
// Read the current year one time when the app loads.
const currentYear = new Date().getFullYear();

// Navigation items configuration.
const NAV_ITEMS = [
  { to: "/archive", label: text.archive.navLink },
  { to: "/atlas", label: text.atlas.navLink },
  { to: "/studio", label: text.studio.navLink },
  { to: "/duel", label: text.duel.navLink },
  { to: "/expeditions", label: text.expeditions.navLink },
  { to: "/learn", label: text.learn.navLink },
  { to: "/exchange", label: text.exchange.navLink },
  { to: "/arcade", label: text.arcade.navLink },
];

function StreakPill() {
  const results = useAppStore((state) => state.results);
  const today = useToday();
  const streak = currentStreak(results, today);
  if (streak === 0) return null;
  return (
    <Link
      to="/atlas"
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
      title={`${streak}${text.streak.word}`}
      aria-label={`${streak}${text.streak.word}`}
    >
      <span aria-hidden="true">{symbols.atlas.streak}</span>
      <span>{streak}</span>
      <span className="hidden sm:inline">{text.streak.word}</span>
    </Link>
  );
}

function BrandLogo() {
  return (
    <Link className={styles.siteName} to="/" viewTransition>
      <span className={styles.brandIcon} aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="9" height="9" rx="2.5" fill="var(--accent)" />
          <rect x="13" y="2" width="9" height="9" rx="2.5" fill="var(--blue)" />
          <rect x="2" y="13" width="9" height="9" rx="2.5" fill="var(--green)" />
          <rect x="13" y="13" width="9" height="9" rx="2.5" fill="var(--yellow)" />
        </svg>
      </span>
      <span>{text.siteName}</span>
    </Link>
  );
}

// This component provides the top navigation bar, smooth scrolling, motion context, and page footer.
export function Layout() {
  useSmoothScroll();
  useReloadAtMidnight();

  return (
    <MotionProvider>
      <ReactiveCursor />
      <a className={styles.skipLink} href="#main">
        {text.skipLink}
      </a>
      <header className={styles.header}>
        <nav aria-label={text.nav.label} className={styles.nav} data-lenis-prevent>
          <BrandLogo />
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => cn(styles.navLink, isActive && styles.navLinkActive)}
              to={item.to}
              viewTransition
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <StreakPill />
          <ThemeSwitcher />
        </div>
      </header>
      <main id="main" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>{text.footer.content(currentYear)}</p>
      </footer>
    </MotionProvider>
  );
}
