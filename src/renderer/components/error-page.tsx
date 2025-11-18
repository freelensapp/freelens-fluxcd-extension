import { Common, type Renderer } from "@freelensapp/extensions";
import React from "react";
import styles from "./error-page.module.scss";
import stylesInline from "./error-page.module.scss?inline";

export interface ErrorPageProps {
  error?: unknown;
  extension: Renderer.LensExtension;
  children?: React.ReactNode;
}

export function ErrorPage({ error, extension, children }: ErrorPageProps) {
  if (error) {
    Common.logger.error(`[${extension.name}]: ${error}`);
  }
  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.errorPage}>
        {error ? <p className={styles.errorMessage}>{String(error)}</p> : <></>}
        {children}
      </div>
    </>
  );
}

/**
 * Wraps component in try/catch block and prints ErrorPage on error.
 * Handles "API not registered" errors gracefully by returning null, allowing available-version pages to try alternative API versions.
 *
 * ```ts
 * export const Component = (props: ComponentProps) => withErrorPage(props, () => {
 *   throw new Error("something died");
 * })
 * ```
 */
export function withErrorPage<P extends { extension: Renderer.LensExtension }>(
  props: P,
  wrapped: (props: P) => JSX.Element,
) {
  try {
    return wrapped(props);
  } catch (error) {
    const errorMessage = String(error);

    if (errorMessage.includes("not registered") || errorMessage.includes("getStore")) {
      Common.logger.debug(`[@freelensapp/fluxcd-extension]: API not available - ${error}`);
      return null;
    }

    return <ErrorPage error={error} extension={props.extension} />;
  }
}
