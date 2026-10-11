import { Common, type Renderer } from "@freelensapp/extensions";
import React from "react";
import { ErrorPage } from "./error-page";

type PageRegistration = Renderer.LensExtension["clusterPages"][number];
type DetailRegistration = Renderer.LensExtension["kubeObjectDetailItems"][number];
type MenuRegistration = Renderer.LensExtension["kubeObjectMenuItems"][number];

export interface ErrorBoundaryProps {
  extension: Renderer.LensExtension;
  /**
   * What renders in place of the children after an error: the error page, or nothing, for a menu item, where an
   * error page would not fit.
   */
  fallback?: "error-page" | "nothing";
  /**
   * A new value clears the error and renders the children again: the object of a details panel or a menu item, which
   * the host replaces with a new one when the object changes.
   */
  resetKey?: unknown;
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
  error?: unknown;
  resetKey?: unknown;
}

/**
 * Keeps an error that its children throw while React renders them inside the boundary: it logs the error with the
 * name of the extension, and renders the error page, or nothing, in place of the children. A `try`/`catch` around
 * the call of a component does not see such an error, nor one that a callback throws when the host calls it from its
 * own render, as `KubeObjectListLayout` does with `renderTableContents`.
 *
 * The host has no boundary around the details drawer and the menu items of an extension, and a boundary of the
 * cluster frame would replace the whole cluster view instead. The registrations of the extension are wrapped with
 * `withPageErrorBoundary`, `withDetailsErrorBoundary` and `withMenuItemErrorBoundary`.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return { failed: true, error };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): ErrorBoundaryState | null {
    return Object.is(props.resetKey, state.resetKey) ? null : { failed: false, resetKey: props.resetKey };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    Common.logger.error(`[${this.props.extension.name}]: ${error}`, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.fallback === "nothing") return null;
    return <ErrorPage error={this.state.error} />;
  }
}

/**
 * The registration of a cluster page, with the page inside an error boundary.
 */
export function withPageErrorBoundary(
  extension: Renderer.LensExtension,
  registration: PageRegistration,
): PageRegistration {
  const { Page } = registration.components;

  return {
    ...registration,
    components: {
      ...registration.components,
      Page: (props) => (
        <ErrorBoundary extension={extension}>
          <Page {...props} />
        </ErrorBoundary>
      ),
    },
  };
}

/**
 * The registration of a details panel, made by `Renderer.K8sApi.detailsFor`, with the panel inside an error
 * boundary that renders it again for a new object.
 */
export function withDetailsErrorBoundary(
  extension: Renderer.LensExtension,
  registration: DetailRegistration,
): DetailRegistration {
  const { Details } = registration.components;

  return {
    ...registration,
    components: {
      ...registration.components,
      Details: (props) => (
        <ErrorBoundary extension={extension} resetKey={props.object}>
          <Details {...props} />
        </ErrorBoundary>
      ),
    },
  };
}

/**
 * The registration of a menu item, made by `Renderer.K8sApi.menuItemFor`, with the item inside an error boundary
 * that renders nothing in the menu after an error, and renders the item again for a new object.
 */
export function withMenuItemErrorBoundary(
  extension: Renderer.LensExtension,
  registration: MenuRegistration,
): MenuRegistration {
  const { MenuItem } = registration.components;

  return {
    ...registration,
    components: {
      ...registration.components,
      MenuItem: (props) => (
        <ErrorBoundary extension={extension} fallback="nothing" resetKey={props.object}>
          <MenuItem {...props} />
        </ErrorBoundary>
      ),
    },
  };
}
