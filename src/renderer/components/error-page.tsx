import React from "react";
import styles from "./error-page.module.scss";

export interface ErrorPageProps {
  error?: unknown;
  children?: React.ReactNode;
}

/**
 * The error, in place of a page or a details panel that threw it. `ErrorBoundary` renders it and logs the error.
 */
export function ErrorPage({ error, children }: ErrorPageProps) {
  return (
    <div className={styles.errorPage}>
      {error ? <p className={styles.errorMessage}>{String(error)}</p> : <></>}
      {children}
    </div>
  );
}
