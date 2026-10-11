// @vitest-environment jsdom

import { Common, type Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GitRepository } from "../k8s/fluxcd/source/gitrepository-v1";
import { GitRepositoriesPage } from "../pages/source/gitrepositories-v1";
import {
  ErrorBoundary,
  withDetailsErrorBoundary,
  withMenuItemErrorBoundary,
  withPageErrorBoundary,
} from "./error-boundary";

const extension = { name: "@freelensapp/fluxcd-extension" } as Renderer.LensExtension;

beforeEach(() => {
  // React reports an error that a boundary caught on the console as well.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

const Throws = ({ message = "boom" }: { message?: string }): React.JSX.Element => {
  throw new Error(message);
};

// A child that throws only for some objects, as a details panel does for an object without a field it reads.
const ThrowsFor = ({ object }: { object: { broken: boolean } }) => {
  if (object.broken) throw new Error("broken object");
  return <p>fine object</p>;
};

describe("ErrorBoundary", () => {
  it("renders the error page in place of a child that throws, logs it, and leaves its siblings rendered", () => {
    render(
      <>
        <p>before</p>
        <ErrorBoundary extension={extension}>
          <p>inside</p>
          <Throws />
        </ErrorBoundary>
        <p>after</p>
      </>,
    );

    expect(screen.getByText("Error: boom")).toBeTruthy();
    expect(screen.queryByText("inside")).toBeNull();
    expect(screen.getByText("before")).toBeTruthy();
    expect(screen.getByText("after")).toBeTruthy();
    expect(Common.logger.error).toHaveBeenCalledTimes(1);
    expect(Common.logger.error).toHaveBeenCalledWith(
      "[@freelensapp/fluxcd-extension]: Error: boom",
      expect.any(String),
    );
  });

  it("renders nothing in place of a child that throws with the fallback nothing, and logs it", () => {
    render(
      <ul>
        <li>Edit</li>
        <ErrorBoundary extension={extension} fallback="nothing">
          <li>Reconcile</li>
          <Throws message="menu item" />
        </ErrorBoundary>
        <li>Delete</li>
      </ul>,
    );

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Edit", "Delete"]);
    expect(Common.logger.error).toHaveBeenCalledWith(
      "[@freelensapp/fluxcd-extension]: Error: menu item",
      expect.any(String),
    );
  });

  it("renders its children without an error", () => {
    render(
      <ErrorBoundary extension={extension}>
        <p>inside</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("inside")).toBeTruthy();
    expect(Common.logger.error).not.toHaveBeenCalled();
  });

  it("renders the children again for a new reset key", () => {
    const broken = { broken: true };
    const fixed = { broken: false };
    const { rerender } = render(
      <ErrorBoundary extension={extension} resetKey={broken}>
        <ThrowsFor object={broken} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Error: broken object")).toBeTruthy();

    rerender(
      <ErrorBoundary extension={extension} resetKey={fixed}>
        <ThrowsFor object={fixed} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("fine object")).toBeTruthy();
    expect(screen.queryByText("Error: broken object")).toBeNull();
  });
});

describe("the registration wrappers", () => {
  it("keep an error of a page inside the page", () => {
    const { Page } = withPageErrorBoundary(extension, {
      id: "broken",
      components: { Page: () => <Throws /> },
    }).components;

    render(
      <>
        <Page params={{}} />
        <p>sidebar</p>
      </>,
    );

    expect(screen.getByText("Error: boom")).toBeTruthy();
    expect(screen.getByText("sidebar")).toBeTruthy();
  });

  // A `try`/`catch` around the call of the page, as `withErrorPage` was, does not see this error: the host calls
  // `renderTableContents` from the render of its own list layout, a child of the page.
  it("keep an error that a callback of the page throws from the render of the host's list layout inside the page", () => {
    vi.spyOn(GitRepository, "getStore").mockReturnValue({
      items: [new GitRepository({ metadata: { name: "without-spec" } } as never)],
    } as never);
    const { Page } = withPageErrorBoundary(extension, {
      id: "gitrepository",
      components: { Page: () => <GitRepositoriesPage extension={extension} /> },
    }).components;

    render(<Page params={{}} />);

    expect(screen.getByText(/TypeError: Cannot read properties of undefined/)).toBeTruthy();
    expect(Common.logger.error).toHaveBeenCalledTimes(1);
  });

  it("keep an error of a details panel inside the panel, and render it again for a new object", () => {
    const { Details } = withDetailsErrorBoundary(extension, {
      kind: "Kustomization",
      apiVersions: ["kustomize.toolkit.fluxcd.io/v1"],
      components: { Details: ThrowsFor },
    }).components;

    const { rerender } = render(
      <>
        <Details object={{ broken: true }} />
        <p>other panel</p>
      </>,
    );

    expect(screen.getByText("Error: broken object")).toBeTruthy();
    expect(screen.getByText("other panel")).toBeTruthy();

    rerender(
      <>
        <Details object={{ broken: false }} />
        <p>other panel</p>
      </>,
    );

    expect(screen.getByText("fine object")).toBeTruthy();
  });

  it("render nothing for a menu item that throws, and leave the other items rendered", () => {
    const { MenuItem } = withMenuItemErrorBoundary(extension, {
      kind: "Kustomization",
      apiVersions: ["kustomize.toolkit.fluxcd.io/v1"],
      components: { MenuItem: () => <Throws message="menu item" /> },
    }).components;

    render(
      <ul>
        <li>Edit</li>
        <MenuItem object={{}} />
        <li>Delete</li>
      </ul>,
    );

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Edit", "Delete"]);
    expect(screen.queryByText(/menu item/)).toBeNull();
    expect(Common.logger.error).toHaveBeenCalledWith(
      "[@freelensapp/fluxcd-extension]: Error: menu item",
      expect.any(String),
    );
  });
});
