import { Renderer } from "@freelensapp/extensions";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  type CrossNamespaceSourceReference,
  type CrossNamespaceSourceReferenceKind,
  HelmRelease,
} from "./helmrelease-v2";
import { HelmRelease as HelmRelease_v2beta1 } from "./helmrelease-v2beta1";
import { HelmRelease as HelmRelease_v2beta2 } from "./helmrelease-v2beta2";

// The helpers that every version has, with the same code, run for each of them. The objects are partial, and each
// version's helper takes its own model, so they are passed as `never`.
describe.each([
  { version: "v2", model: HelmRelease },
  { version: "v2beta2", model: HelmRelease_v2beta2 },
  { version: "v2beta1", model: HelmRelease_v2beta1 },
])("HelmRelease $version", ({ model }) => {
  const object = (data: Record<string, unknown>) => data as never;

  describe("getAppVersion / getChartVersion", () => {
    test("reads the app version from the newest history entry", () => {
      expect(model.getAppVersion(object({ status: { history: [{ appVersion: "1.2.3" }] } }))).toBe("1.2.3");
    });

    test("prefers the history chart version over the spec version", () => {
      const helmRelease = object({
        status: { history: [{ chartVersion: "2.0.0" }] },
        spec: { chart: { spec: { version: "1.0.0" } } },
      });
      expect(model.getChartVersion(helmRelease)).toBe("2.0.0");
    });

    test("falls back to the spec chart version when there is no history", () => {
      const helmRelease = object({ status: {}, spec: { chart: { spec: { version: "1.0.0" } } } });
      expect(model.getChartVersion(helmRelease)).toBe("1.0.0");
    });
  });

  describe("getReleaseName", () => {
    test("uses spec.releaseName when set", () => {
      const helmRelease = object({ metadata: { name: "hr" }, spec: { releaseName: "custom" } });
      expect(model.getReleaseName(helmRelease)).toBe("custom");
    });

    test("prefixes the target namespace when there is no release name", () => {
      const helmRelease = object({ metadata: { name: "hr" }, spec: { targetNamespace: "apps" } });
      expect(model.getReleaseName(helmRelease)).toBe("apps-hr");
    });

    test("falls back to the metadata name", () => {
      expect(model.getReleaseName(object({ metadata: { name: "hr" }, spec: {} }))).toBe("hr");
    });
  });

  describe("getReleaseNameShortened", () => {
    test("leaves short names untouched", () => {
      expect(model.getReleaseNameShortened(object({ metadata: { name: "short" }, spec: {} }))).toBe("short");
    });

    test("truncates and appends a hash for names longer than 53 characters", () => {
      const name = "a".repeat(60);
      const result = model.getReleaseNameShortened(object({ metadata: { name }, spec: {} }));
      expect(result).toMatch(/^a{40}-[0-9a-f]{12}$/);
      expect(result.length).toBe(53);
      // The first 12 hex digits of the SHA-256 of the name, as helm-controller
      // computes the storage name.
      expect(result).toBe(`${"a".repeat(40)}-11ee391211c6`);
    });
  });

  describe("getHelmReleaseUrl", () => {
    test("links the release in the namespace it is given", () => {
      const helmRelease = object({ metadata: { name: "hr" }, spec: { releaseName: "podinfo" } });
      expect(model.getHelmReleaseUrl(helmRelease, "apps")).toBe("/helm/releases/apps/podinfo");
    });

    test("links the release in its storage namespace", () => {
      const helmRelease = object({
        metadata: { name: "hr" },
        spec: { storageNamespace: "helm", targetNamespace: "apps" },
      });
      expect(model.getHelmReleaseUrl(helmRelease, "flux-system")).toBe("/helm/releases/helm/apps-hr");
    });
  });

  describe("getSourceRefText / getSourceRefName", () => {
    test("formats the chart source ref", () => {
      const helmRelease = object({
        spec: { chart: { spec: { sourceRef: { kind: "HelmRepository", namespace: "flux-system", name: "repo" } } } },
      });
      expect(model.getSourceRefText(helmRelease)).toBe("HelmRepository: flux-system/repo");
      expect(model.getSourceRefName(helmRelease)).toBe("repo");
    });

    test("falls back to chartRef when there is no inline chart", () => {
      const helmRelease = object({ spec: { chartRef: { kind: "OCIRepository", name: "oci" } } });
      expect(model.getSourceRefText(helmRelease)).toBe("OCIRepository: oci");
      expect(model.getSourceRefName(helmRelease)).toBe("oci");
    });
  });
});

// The helpers of the beta versions that v2 replaced with getChartTemplateRef.
describe.each([
  { version: "v2beta2", model: HelmRelease_v2beta2 },
  { version: "v2beta1", model: HelmRelease_v2beta1 },
])("HelmRelease $version getChartRefNamespace / getHelmChartName", ({ model }) => {
  // An instance of the stub's base class, whose getNs() the fallback calls.
  const object = (data: Record<string, unknown>) => new model(data as never);

  test("takes the namespace of the chart's sourceRef", () => {
    const helmRelease = object({
      metadata: { name: "hr", namespace: "apps" },
      spec: { chart: { spec: { chart: "podinfo", sourceRef: { kind: "HelmRepository", namespace: "flux-system" } } } },
    });
    expect(model.getChartRefNamespace(helmRelease as never)).toBe("flux-system");
    expect(model.getHelmChartName(helmRelease as never)).toBe("flux-system-hr");
  });

  test("takes the namespace of the chartRef", () => {
    const helmRelease = object({
      metadata: { name: "hr", namespace: "apps" },
      spec: { chartRef: { kind: "OCIRepository", name: "podinfo", namespace: "sources" } },
    });
    expect(model.getChartRefNamespace(helmRelease as never)).toBe("sources");
  });

  test("falls back to the namespace of the HelmRelease", () => {
    const helmRelease = object({
      metadata: { name: "hr", namespace: "apps" },
      spec: { chart: { spec: { chart: "podinfo", sourceRef: { kind: "HelmRepository" } } } },
    });
    expect(model.getChartRefNamespace(helmRelease as never)).toBe("apps");
    expect(model.getHelmChartName(helmRelease as never)).toBe("apps-hr");
  });
});

describe("HelmRelease.getChartTemplateRef", () => {
  test("is undefined without a chart template", () => {
    const object = { metadata: { name: "hr", namespace: "apps" }, spec: { chartRef: {} } } as unknown as HelmRelease;
    expect(HelmRelease.getChartTemplateRef(object)).toBeUndefined();
  });

  test("names a HelmChart after the HelmRelease, in the namespace of the sourceRef, before it is created", () => {
    const object = {
      metadata: { name: "hr", namespace: "apps" },
      spec: { chart: { spec: { chart: "podinfo", sourceRef: { kind: "HelmRepository", namespace: "flux-system" } } } },
    } as unknown as HelmRelease;
    expect(HelmRelease.getChartTemplateRef(object)).toEqual({
      kind: "HelmChart",
      name: "apps-hr",
      namespace: "flux-system",
    });
  });

  test("reads a HelmChart from the namespace/name of status.helmChart", () => {
    const object = {
      metadata: { name: "hr", namespace: "apps" },
      spec: { chart: { spec: { chart: "podinfo", sourceRef: { kind: "HelmRepository" } } } },
      status: { helmChart: "flux-system/flux-system-hr" },
    } as unknown as HelmRelease;
    expect(HelmRelease.getChartTemplateRef(object)).toEqual({
      kind: "HelmChart",
      name: "flux-system-hr",
      namespace: "flux-system",
    });
  });

  test("reads an OCIRepository from the kind/namespace/name of status.helmChart", () => {
    const object = {
      metadata: { name: "hr", namespace: "apps" },
      spec: { chart: { kind: "OCIRepository", spec: { url: "oci://ghcr.io/stefanprodan/charts/podinfo" } } },
      status: { helmChart: "OCIRepository/apps/apps-hr" },
    } as unknown as HelmRelease;
    expect(HelmRelease.getChartTemplateRef(object)).toEqual({
      kind: "OCIRepository",
      name: "apps-hr",
      namespace: "apps",
    });
  });

  test("names an OCIRepository after the HelmRelease, in its namespace, before it is created", () => {
    const object = {
      metadata: { name: "hr", namespace: "apps" },
      spec: { chart: { kind: "OCIRepository", spec: { url: "oci://ghcr.io/stefanprodan/charts/podinfo" } } },
      status: { helmChart: "apps/apps-hr" },
    } as unknown as HelmRelease;
    expect(HelmRelease.getChartTemplateRef(object)).toEqual({
      kind: "OCIRepository",
      name: "apps-hr",
      namespace: "apps",
    });
  });
});

describe("HelmRelease.getSourceRefText", () => {
  test("formats the OCIRepository that an OCIRepository chart template generates", () => {
    const object = {
      metadata: { name: "hr", namespace: "apps" },
      spec: { chart: { kind: "OCIRepository", spec: { url: "oci://ghcr.io/stefanprodan/charts/podinfo" } } },
    } as unknown as HelmRelease;
    expect(HelmRelease.getSourceRefText(object)).toBe("OCIRepository: apps/apps-hr");
    expect(HelmRelease.getSourceRefName(object)).toBe("apps-hr");
  });
});

describe("HelmRelease chartRef", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("takes the kinds of the upstream enum only", () => {
    const kinds: CrossNamespaceSourceReferenceKind[] = ["OCIRepository", "HelmChart", "ExternalArtifact"];
    expect(kinds).toHaveLength(3);
    // @ts-expect-error a GitRepository is a source of spec.chart, not of spec.chartRef
    const gitRepository: CrossNamespaceSourceReferenceKind = "GitRepository";
    expect(gitRepository).toBe("GitRepository");
  });

  test("formats and links an ExternalArtifact with the version the cluster serves", () => {
    const externalArtifactApi = {
      kind: "ExternalArtifact",
      apiGroup: "source.toolkit.fluxcd.io",
      apiVersion: "v1",
      apiVersionWithGroup: "source.toolkit.fluxcd.io/v1",
      formatUrlForNotListing: ({ name, namespace }: { name?: string; namespace?: string }) =>
        `/apis/source.toolkit.fluxcd.io/v1/namespaces/${namespace}/externalartifacts/${name}`,
    };
    vi.spyOn(Renderer.K8sApi.apiManager, "getApi").mockImplementation((callback) =>
      typeof callback === "function" && callback(externalArtifactApi as never)
        ? (externalArtifactApi as never)
        : undefined,
    );
    const chartRef: CrossNamespaceSourceReference = { kind: "ExternalArtifact", name: "podinfo" };
    const object = { metadata: { namespace: "fluxcd-test" }, spec: { chartRef } } as unknown as HelmRelease;

    expect(HelmRelease.getSourceRefText(object)).toBe("ExternalArtifact: podinfo");
    expect(HelmRelease.getSourceRefUrl(object)).toBe(
      "/apis/source.toolkit.fluxcd.io/v1/namespaces/fluxcd-test/externalartifacts/podinfo",
    );
  });
});
