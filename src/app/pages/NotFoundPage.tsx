import { Link } from "react-router";
import { text } from "../../text/en";
import styles from "../RouteError.module.css";

// This page tells the user that the requested path does not exist.
export function NotFoundPage() {
  return (
    <div className={styles.card}>
      <title>{`${text.notFound.title} | ${text.siteName}`}</title>
      <h1 data-testid="not-found-page-title" className={styles.title}>
        {text.notFound.title}
      </h1>
      <p className={styles.body}>{text.notFound.body}</p>
      <p>
        <Link className={styles.link} to="/">
          {text.notFound.homeLink}
        </Link>
      </p>
    </div>
  );
}
