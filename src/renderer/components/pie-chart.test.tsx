// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getStats, PieChart } from "./pie-chart";

afterEach(() => {
  cleanup();
});

type StatsObject = Parameters<typeof getStats>[0][number];

const object = (data: {
  kind?: string;
  metadata?: Record<string, unknown>;
  spec?: Record<string, unknown>;
  status?: Record<string, unknown>;
}) => ({ kind: "Kustomization", metadata: {}, spec: {}, ...data }) as unknown as StatsObject;

const readyCondition = (status: string) => ({ conditions: [{ type: "Ready", status }] });

describe("getStats", () => {
  // [ready, notReady, inProgress, suspended, unknown]
  const sum = (stats: number[]) => stats.reduce((a, b) => a + b, 0);

  it("counts a suspended object without a status as suspended only", () => {
    const objects = [
      object({ status: readyCondition("True") }),
      object({ status: readyCondition("False") }),
      object({ spec: { suspend: true } }),
    ];

    const stats = getStats(objects);

    expect(stats).toEqual([1, 1, 0, 1, 0]);
    expect(sum(stats)).toBe(objects.length);
  });

  it("counts a suspended object with conditions as suspended only", () => {
    const objects = [
      object({ spec: { suspend: true }, status: readyCondition("True") }),
      object({ spec: { suspend: true }, status: readyCondition("False") }),
      object({ spec: { suspend: true }, status: readyCondition("Unknown") }),
    ];

    const stats = getStats(objects);

    expect(stats).toEqual([0, 0, 0, 3, 0]);
    expect(sum(stats)).toBe(objects.length);
  });

  it("counts an object without a spec, as an ExternalArtifact, by its conditions", () => {
    const objects = [
      object({ kind: "ExternalArtifact", spec: undefined, status: readyCondition("True") }),
      object({ kind: "ExternalArtifact", spec: undefined }),
    ];

    const stats = getStats(objects);

    expect(stats).toEqual([1, 0, 0, 0, 1]);
    expect(sum(stats)).toBe(objects.length);
  });

  it("counts an ArtifactGenerator suspended by its annotation as suspended only", () => {
    const annotations = (value: string) => ({ annotations: { "source.extensions.fluxcd.io/reconcile": value } });
    const objects = [
      object({ kind: "ArtifactGenerator", metadata: annotations("disabled"), status: readyCondition("False") }),
      object({ kind: "ArtifactGenerator", metadata: annotations("enabled"), status: readyCondition("True") }),
      object({ kind: "ArtifactGenerator", status: readyCondition("True") }),
      // The annotation of source-watcher has no effect on another kind.
      object({ metadata: annotations("disabled"), status: readyCondition("True") }),
    ];

    const stats = getStats(objects);

    expect(stats).toEqual([3, 0, 0, 1, 0]);
    expect(sum(stats)).toBe(objects.length);
  });

  it.each(["FluxInstance", "FluxReport", "ResourceSet", "ResourceSetInputProvider"])(
    "counts a %s suspended by its annotation as suspended only",
    (kind) => {
      const annotations = (key: string, value: string) => ({ annotations: { [key]: value } });
      const objects = [
        object({
          kind,
          metadata: annotations("fluxcd.controlplane.io/reconcile", "disabled"),
          status: readyCondition("True"),
        }),
        object({
          kind,
          metadata: annotations("fluxcd.controlplane.io/reconcile", "Disabled"),
          status: readyCondition("False"),
        }),
        object({
          kind,
          metadata: annotations("fluxcd.controlplane.io/reconcile", "Enabled"),
          status: readyCondition("True"),
        }),
        object({ kind, status: readyCondition("True") }),
        // The annotation of source-watcher has no effect on a Flux Operator kind.
        object({
          kind,
          metadata: annotations("source.extensions.fluxcd.io/reconcile", "disabled"),
          status: readyCondition("True"),
        }),
      ];

      const stats = getStats(objects);

      expect(stats).toEqual([3, 0, 0, 2, 0]);
      expect(sum(stats)).toBe(objects.length);
    },
  );

  it("counts an ArtifactGenerator whose annotation is Disabled as suspended", () => {
    const objects = [
      object({
        kind: "ArtifactGenerator",
        metadata: { annotations: { "source.extensions.fluxcd.io/reconcile": "Disabled" } },
        status: readyCondition("True"),
      }),
      // The annotation of the Flux Operator has no effect on an ArtifactGenerator.
      object({
        kind: "ArtifactGenerator",
        metadata: { annotations: { "fluxcd.controlplane.io/reconcile": "disabled" } },
        status: readyCondition("True"),
      }),
    ];

    expect(getStats(objects)).toEqual([1, 0, 0, 1, 0]);
  });

  it("counts an object without a status that is not suspended as unknown", () => {
    const objects = [object({}), object({ spec: { suspend: false } })];

    const stats = getStats(objects);

    expect(stats).toEqual([0, 0, 0, 0, 2]);
    expect(sum(stats)).toBe(objects.length);
  });

  it("counts an object whose Ready condition is neither True nor False as in progress", () => {
    const objects = [object({ status: readyCondition("Unknown") }), object({ status: { conditions: [] } })];

    const stats = getStats(objects);

    expect(stats).toEqual([0, 0, 2, 0, 0]);
    expect(sum(stats)).toBe(objects.length);
  });

  it("counts an OCI HelmRepository as ready unless it is suspended", () => {
    const objects = [
      object({ kind: "HelmRepository", spec: { type: "oci" } }),
      object({ kind: "HelmRepository", spec: { type: "oci" }, status: readyCondition("False") }),
      object({ kind: "HelmRepository", spec: { type: "oci", suspend: true } }),
    ];

    const stats = getStats(objects);

    expect(stats).toEqual([2, 0, 0, 1, 0]);
    expect(sum(stats)).toBe(objects.length);
  });
});

describe("PieChart", () => {
  it("opens the cluster page of the kind through the extension", () => {
    const navigate = vi.fn(() => Promise.resolve());
    const extension: Partial<Renderer.LensExtension> = { navigate };
    const crd = {
      spec: { names: { kind: "GitRepository", singular: "gitrepository" } },
    } as Renderer.K8sApi.CustomResourceDefinition;

    render(
      <PieChart extension={extension as Renderer.LensExtension} title="Git Repositories" objects={[]} crd={crd} />,
    );
    fireEvent.click(screen.getByText("Git Repositories (0)"));

    expect(navigate).toHaveBeenCalledExactlyOnceWith("gitrepository");
  });
});
