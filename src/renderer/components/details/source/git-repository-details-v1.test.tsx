// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GitRepository } from "../../../k8s/fluxcd/source/gitrepository-v1";
import { GitRepositoryDetails } from "./git-repository-details-v1";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof GitRepositoryDetails>[0];

const gitRepository = (spec: Record<string, unknown> = {}, status?: Record<string, unknown>) =>
  new GitRepository({
    apiVersion: "source.toolkit.fluxcd.io/v1",
    kind: "GitRepository",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { interval: "1m", url: "https://github.com/stefanprodan/podinfo", ...spec },
    status,
  } as unknown as ConstructorParameters<typeof GitRepository>[0]);

const renderDetails = (object: GitRepository) =>
  render(<GitRepositoryDetails {...({ object } as unknown as DetailsProps)} />);

// The text of each drawer item named `name`, nested ones included.
const drawerItems = (name: string) =>
  screen
    .queryAllByTestId("drawer-item")
    .map((item) => item.textContent)
    .filter((text) => text?.startsWith(`${name}: `));

describe("GitRepositoryDetails Last Handled Reconcile At", () => {
  it("hides the item without the field", () => {
    renderDetails(gitRepository());

    expect(drawerItems("Last Handled Reconcile At")).toEqual([]);
  });

  it("shows the time of the last handled reconcile request", () => {
    renderDetails(gitRepository({}, { lastHandledReconcileAt: "2026-11-26T12:00:00Z" }));

    expect(drawerItems("Last Handled Reconcile At")).toEqual(["Last Handled Reconcile At: 2026-11-26T12:00:00Z"]);
  });
});
