import { useEffect } from "react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { text } from "../text/en";
import styles from "./RouteError.module.css";
import { getLogger } from "../shared/logger";

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
      <div className={styles.card}>
        <title>{`${text.routeError.title} | ${text.siteName}`}</title>
        <h1 data-testid="route-error-title" className={styles.title}>
          {text.routeError.title}
        </h1>
        <p className={styles.body}>{text.routeError.body}</p>
        <p>
          <Link className={styles.link} to="/">
            {text.routeError.homeLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
