import { Link } from "react-router";
import { buttonVariants } from "../../shared/ui/button-variants";
import { text } from "../../text/en";
import styles from "../RouteError.module.css";

// ASD-STE100 Simplified Technical English comments.
// This page tells the user that the requested path does not exist.
export function NotFoundPage() {
  return (
    <div className={`sk-surface-card ${styles.card}`}>
      <title>{`${text.notFound.title} | ${text.siteName}`}</title>
      <h1 data-testid="not-found-page-title" className={styles.title}>
        {text.notFound.title}
      </h1>
      <p className={styles.body}>{text.notFound.body}</p>
      <p>
        <Link className={buttonVariants({ variant: "primary", size: "lg" })} to="/">
          {text.notFound.homeLink}
        </Link>
      </p>
    </div>
  );
}
