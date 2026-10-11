// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FluxInstance } from "../k8s/fluxcd/controlplane/fluxinstance-v1";
import { FluxReport } from "../k8s/fluxcd/controlplane/fluxreport-v1";
import { ResourceSet } from "../k8s/fluxcd/controlplane/resourceset-v1";
import { ResourceSetInputProvider } from "../k8s/fluxcd/controlplane/resourcesetinputprovider-v1";
import { fluxOperatorReconcileAnnotation } from "../k8s/fluxcd/controlplane/types";
import { ArtifactGenerator, sourceWatcherReconcileAnnotation } from "../k8s/fluxcd/source/artifactgenerator-v1beta1";
import { FluxInstancesPage } from "./controlplane/fluxinstances-v1";
import { FluxReportsPage } from "./controlplane/fluxreports-v1";
import { ResourceSetInputProvidersPage } from "./controlplane/resourcesetinputproviders-v1";
import { ResourceSetsPage } from "./controlplane/resourcesets-v1";
import { ArtifactGeneratorsPage } from "./source/artifactgenerators-v1beta1";

import type React from "react";

const extension = { name: "fluxcd-extension" } as Renderer.LensExtension;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// The kinds without `spec.suspend`, each with its page, its reconcile annotation and the annotation of the other
// controller, and whether the page has an Enabled column.
const pages: {
  kubeObjectClass: typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;
  Page: React.ComponentType<{ extension: Renderer.LensExtension }>;
  annotation: string;
  otherAnnotation: string;
  enabledColumn: boolean;
}[] = [
  {
    kubeObjectClass: FluxInstance,
    Page: FluxInstancesPage,
    annotation: fluxOperatorReconcileAnnotation,
    otherAnnotation: sourceWatcherReconcileAnnotation,
    enabledColumn: true,
  },
  {
    kubeObjectClass: FluxReport,
    Page: FluxReportsPage,
    annotation: fluxOperatorReconcileAnnotation,
    otherAnnotation: sourceWatcherReconcileAnnotation,
    enabledColumn: true,
  },
  {
    kubeObjectClass: ResourceSet,
    Page: ResourceSetsPage,
    annotation: fluxOperatorReconcileAnnotation,
    otherAnnotation: sourceWatcherReconcileAnnotation,
    enabledColumn: true,
  },
  {
    kubeObjectClass: ResourceSetInputProvider,
    Page: ResourceSetInputProvidersPage,
    annotation: fluxOperatorReconcileAnnotation,
    otherAnnotation: sourceWatcherReconcileAnnotation,
    enabledColumn: true,
  },
  {
    kubeObjectClass: ArtifactGenerator,
    Page: ArtifactGeneratorsPage,
    annotation: sourceWatcherReconcileAnnotation,
    otherAnnotation: fluxOperatorReconcileAnnotation,
    enabledColumn: false,
  },
];

// A ready object, as the host's store holds it, with the fields the pages read.
const readyObject = (annotations?: Record<string, string>) => ({
  metadata: { name: "flux", namespace: "flux-system", annotations },
  spec: { distribution: { version: "v2.7.0" } },
  status: {
    conditions: [
      {
        type: "Ready",
        status: "True",
        reason: "ReconciliationSucceeded",
        message: "",
        lastTransitionTime: "2026-10-01T00:00:00Z",
      },
    ],
  },
  getName: () => "flux",
  getNs: () => "flux-system",
  getCreationTimestamp: () => "2026-10-01T00:00:00Z",
  getSearchFields: () => [],
});

const renderPage = (page: (typeof pages)[number], annotations?: Record<string, string>) => {
  vi.spyOn(page.kubeObjectClass, "getStore").mockReturnValue({ items: [readyObject(annotations)] } as never);
  render(<page.Page extension={extension} />);
};

describe.each(pages)("the page of $kubeObjectClass.kind", (page) => {
  it.each(["disabled", "Disabled"])("shows an object whose reconcile annotation is %s as suspended", (value) => {
    renderPage(page, { [page.annotation]: value });

    expect(screen.getByText("Suspended").className).toBe("info");
    expect(screen.queryByText("Ready")).toBeNull();
    if (page.enabledColumn) expect(screen.getByText("False")).toBeTruthy();
  });

  it.each([undefined, "enabled", "Enabled"])(
    "shows an object whose reconcile annotation is %s by its conditions",
    (value) => {
      renderPage(page, value === undefined ? undefined : { [page.annotation]: value });

      expect(screen.getByText("Ready").className).toBe("success");
      expect(screen.queryByText("Suspended")).toBeNull();
      if (page.enabledColumn) expect(screen.getByText("True")).toBeTruthy();
    },
  );

  it("ignores the reconcile annotation of the other controller", () => {
    renderPage(page, { [page.otherAnnotation]: "disabled" });

    expect(screen.getByText("Ready").className).toBe("success");
    expect(screen.queryByText("Suspended")).toBeNull();
  });
});
