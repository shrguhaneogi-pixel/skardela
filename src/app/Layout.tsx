import { Link, NavLink, Outlet } from "react-router";
import { text } from "../text/en";
import { ReactiveCursor } from "../shared/ReactiveCursor";
import styles from "./Layout.module.css";
import { ThemeSwitcher } from "./ThemeSwitcher";

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
];

function BrandLogo() {
  return (
    <Link className={styles.siteName} to="/">
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

// This component provides the top navigation bar and the page footer.
export function Layout() {
  return (
    <>
      <ReactiveCursor />
      <a className={styles.skipLink} href="#main">
        {text.skipLink}
      </a>
      <header className={styles.header}>
        <nav aria-label={text.nav.label} className={styles.nav}>
          <BrandLogo />
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <ThemeSwitcher />
      </header>
      <main id="main" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>{text.footer.content(currentYear)}</p>
      </footer>
    </>
  );
}
