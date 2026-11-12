import { useEffect } from "react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { getLogger } from "../shared/logger";
import { buttonVariants } from "../shared/ui/button-variants";
import { text } from "../text/en";
import styles from "./RouteError.module.css";

// ASD-STE100 Simplified Technical English comments.
// This view shows a clear message when a route fails.
export function RouteError() {
  const error = useRouteError();
  useEffect(() => {
    const log = getLogger("app.route-error");
    if (isRouteErrorResponse(error)) {
      log.error("Route error response", {
        status: error.status,
        statusText: error.statusText,
      });
    } else {
      log.error("Route error thrown", error);
    }
  }, [error]);

  return (
    <main className={styles.main}>
      <div className={`sk-surface-card ${styles.card}`}>
        <title>{`${text.routeError.title} | ${text.siteName}`}</title>
        <h1 data-testid="route-error-title" className={styles.title}>
          {text.routeError.title}
        </h1>
        <p className={styles.body}>{text.routeError.body}</p>
        <p>
          <Link
            className={buttonVariants({ variant: "primary", size: "lg" })}
            to="/"
            viewTransition
          >
            {text.routeError.homeLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
