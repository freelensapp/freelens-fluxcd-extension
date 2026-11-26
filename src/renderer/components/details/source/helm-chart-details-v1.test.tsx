// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HelmChart } from "../../../k8s/fluxcd/source/helmchart-v1";
import { HelmChartDetails } from "./helm-chart-details-v1";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof HelmChartDetails>[0];

const helmChart = (spec: Record<string, unknown> = {}, status?: Record<string, unknown>) =>
  new HelmChart({
    apiVersion: "source.toolkit.fluxcd.io/v1",
    kind: "HelmChart",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { interval: "1m", chart: "podinfo", sourceRef: { kind: "HelmRepository", name: "podinfo" }, ...spec },
    status,
  } as unknown as ConstructorParameters<typeof HelmChart>[0]);

const renderDetails = (object: HelmChart) => render(<HelmChartDetails {...({ object } as unknown as DetailsProps)} />);

// The text of each drawer item named `name`, nested ones included.
const drawerItems = (name: string) =>
  screen
    .queryAllByTestId("drawer-item")
    .map((item) => item.textContent)
    .filter((text) => text?.startsWith(`${name}: `));

describe("HelmChartDetails Last Handled Reconcile At", () => {
  it("hides the item without the field", () => {
    renderDetails(helmChart());

    expect(drawerItems("Last Handled Reconcile At")).toEqual([]);
  });

  it("shows the time of the last handled reconcile request", () => {
    renderDetails(helmChart({}, { lastHandledReconcileAt: "2026-11-26T12:00:00Z" }));

    expect(drawerItems("Last Handled Reconcile At")).toEqual(["Last Handled Reconcile At: 2026-11-26T12:00:00Z"]);
  });
});

describe("HelmChartDetails observed fields", () => {
  it("hides the observed fields and the Latest Artifact URL without the status", () => {
    renderDetails(helmChart());

    expect(drawerItems("Observed Chart Name")).toEqual([]);
    expect(drawerItems("Observed Source Artifact Revision")).toEqual([]);
    expect(drawerItems("Observed Values Files")).toEqual([]);
    expect(drawerItems("Latest Artifact URL")).toEqual([]);
  });

  it("hides the observed values files with an empty list", () => {
    renderDetails(helmChart({}, { observedValuesFiles: [] }));

    expect(drawerItems("Observed Values Files")).toEqual([]);
  });

  it("shows the observed fields and the Latest Artifact URL", () => {
    renderDetails(
      helmChart(
        {},
        {
          observedChartName: "podinfo",
          observedSourceArtifactRevision: "sha256:abc",
          observedValuesFiles: ["values.yaml", "values-prod.yaml"],
          url: "http://source-controller.flux-system.svc.cluster.local./helmchart/fluxcd-test/podinfo/latest.tar.gz",
        },
      ),
    );

    expect(drawerItems("Observed Chart Name")).toEqual(["Observed Chart Name: podinfo"]);
    expect(drawerItems("Observed Source Artifact Revision")).toEqual(["Observed Source Artifact Revision: sha256:abc"]);
    expect(drawerItems("Observed Values Files")).toEqual(["Observed Values Files: values.yamlvalues-prod.yaml"]);
    expect(drawerItems("Latest Artifact URL")).toEqual([
      "Latest Artifact URL: http://source-controller.flux-system.svc.cluster.local./helmchart/fluxcd-test/podinfo/latest.tar.gz",
    ]);
  });
});
