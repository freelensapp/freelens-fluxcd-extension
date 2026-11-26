// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HelmRepository } from "../../../k8s/fluxcd/source/helmrepository-v1";
import { HelmRepositoryDetails } from "./helm-repository-details-v1";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof HelmRepositoryDetails>[0];

const helmRepository = (spec: Record<string, unknown> = {}, status?: Record<string, unknown>) =>
  new HelmRepository({
    apiVersion: "source.toolkit.fluxcd.io/v1",
    kind: "HelmRepository",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { interval: "1m", url: "https://stefanprodan.github.io/podinfo", ...spec },
    status,
  } as unknown as ConstructorParameters<typeof HelmRepository>[0]);

const renderDetails = (object: HelmRepository) =>
  render(<HelmRepositoryDetails {...({ object } as unknown as DetailsProps)} />);

// The text of each drawer item named `name`, nested ones included.
const drawerItems = (name: string) =>
  screen
    .queryAllByTestId("drawer-item")
    .map((item) => item.textContent)
    .filter((text) => text?.startsWith(`${name}: `));

describe("HelmRepositoryDetails Last Handled Reconcile At", () => {
  it("hides the item without the field", () => {
    renderDetails(helmRepository());

    expect(drawerItems("Last Handled Reconcile At")).toEqual([]);
  });

  it("shows the time of the last handled reconcile request", () => {
    renderDetails(helmRepository({}, { lastHandledReconcileAt: "2026-11-26T12:00:00Z" }));

    expect(drawerItems("Last Handled Reconcile At")).toEqual(["Last Handled Reconcile At: 2026-11-26T12:00:00Z"]);
  });
});

describe("HelmRepositoryDetails URL and type", () => {
  it("shows the URL and the default type of the repository", () => {
    renderDetails(helmRepository());

    expect(drawerItems("URL")).toEqual(["URL: https://stefanprodan.github.io/podinfo"]);
    expect(drawerItems("Type")).toEqual(["Type: default"]);
  });

  it("shows the type of an OCI repository", () => {
    renderDetails(helmRepository({ type: "oci", url: "oci://ghcr.io/stefanprodan/charts" }));

    expect(drawerItems("URL")).toEqual(["URL: oci://ghcr.io/stefanprodan/charts"]);
    expect(drawerItems("Type")).toEqual(["Type: oci"]);
  });
});

describe("HelmRepositoryDetails Latest Artifact URL", () => {
  it("hides the item without the field", () => {
    renderDetails(helmRepository());

    expect(drawerItems("Latest Artifact URL")).toEqual([]);
  });

  it("shows the fetch link of the latest artifact", () => {
    renderDetails(
      helmRepository(
        {},
        {
          url: "http://source-controller.flux-system.svc.cluster.local./helmrepository/fluxcd-test/podinfo/index.yaml",
        },
      ),
    );

    expect(drawerItems("Latest Artifact URL")).toEqual([
      "Latest Artifact URL: http://source-controller.flux-system.svc.cluster.local./helmrepository/fluxcd-test/podinfo/index.yaml",
    ]);
  });
});
