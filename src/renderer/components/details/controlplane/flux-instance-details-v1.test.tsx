// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FluxInstance } from "../../../k8s/fluxcd/controlplane/fluxinstance-v1";
import { FluxInstanceDetails } from "./flux-instance-details-v1";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof FluxInstanceDetails>[0];

const fluxInstance = (cluster?: Record<string, unknown>) =>
  new FluxInstance({
    apiVersion: "fluxcd.controlplane.io/v1",
    kind: "FluxInstance",
    metadata: { name: "flux", namespace: "flux-system" },
    spec: {
      distribution: { version: "2.x", registry: "ghcr.io/fluxcd" },
      components: ["source-controller", "source-watcher"],
      ...(cluster ? { cluster } : {}),
    },
  } as unknown as ConstructorParameters<typeof FluxInstance>[0]);

const renderDetails = (object: FluxInstance) =>
  render(<FluxInstanceDetails {...({ object } as unknown as DetailsProps)} />);

const drawerItems = () => screen.getAllByTestId("drawer-item").map((item) => item.textContent);

describe("FluxInstanceDetails", () => {
  it("shows the Source Watcher of the cluster with its namespaceManager", () => {
    renderDetails(fluxInstance({ sourceWatcher: { namespaceManager: true } }));

    expect(drawerItems()).toContain("Source Watcher: Namespace Manager: True");
  });

  it("shows namespaceManager as False when the Source Watcher of the cluster does not set it", () => {
    renderDetails(fluxInstance({ sourceWatcher: {} }));

    expect(drawerItems()).toContain("Source Watcher: Namespace Manager: False");
  });

  it("hides the Source Watcher without spec.cluster.sourceWatcher", () => {
    renderDetails(fluxInstance({ type: "kubernetes" }));

    const items = drawerItems();
    expect(items).toContain("Type: kubernetes");
    expect(items.some((item) => item?.startsWith("Source Watcher: "))).toBe(false);
  });
});
