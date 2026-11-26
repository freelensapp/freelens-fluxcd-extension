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
