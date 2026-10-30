import { Renderer } from "@freelensapp/extensions";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  type CrossNamespaceSourceReference,
  type CrossNamespaceSourceReferenceKind,
  HelmRelease,
} from "./helmrelease-v2";

describe("HelmRelease.getAppVersion / getChartVersion", () => {
  test("reads the app version from the newest history entry", () => {
    const object = { status: { history: [{ appVersion: "1.2.3" }] } } as unknown as HelmRelease;
    expect(HelmRelease.getAppVersion(object)).toBe("1.2.3");
  });

  test("prefers the history chart version over the spec version", () => {
    const object = {
      status: { history: [{ chartVersion: "2.0.0" }] },
      spec: { chart: { spec: { version: "1.0.0" } } },
    } as unknown as HelmRelease;
    expect(HelmRelease.getChartVersion(object)).toBe("2.0.0");
  });

  test("falls back to the spec chart version when there is no history", () => {
    const object = { status: {}, spec: { chart: { spec: { version: "1.0.0" } } } } as unknown as HelmRelease;
    expect(HelmRelease.getChartVersion(object)).toBe("1.0.0");
  });
});

describe("HelmRelease.getReleaseName", () => {
  test("uses spec.releaseName when set", () => {
    const object = { metadata: { name: "hr" }, spec: { releaseName: "custom" } } as unknown as HelmRelease;
    expect(HelmRelease.getReleaseName(object)).toBe("custom");
  });

  test("prefixes the target namespace when there is no release name", () => {
    const object = { metadata: { name: "hr" }, spec: { targetNamespace: "apps" } } as unknown as HelmRelease;
    expect(HelmRelease.getReleaseName(object)).toBe("apps-hr");
  });

  test("falls back to the metadata name", () => {
    const object = { metadata: { name: "hr" }, spec: {} } as unknown as HelmRelease;
    expect(HelmRelease.getReleaseName(object)).toBe("hr");
  });
});

describe("HelmRelease.getReleaseNameShortened", () => {
  test("leaves short names untouched", () => {
    const object = { metadata: { name: "short" }, spec: {} } as unknown as HelmRelease;
    expect(HelmRelease.getReleaseNameShortened(object)).toBe("short");
  });

  test("truncates and appends a hash for names longer than 53 characters", () => {
    const name = "a".repeat(60);
    const object = { metadata: { name }, spec: {} } as unknown as HelmRelease;
    const result = HelmRelease.getReleaseNameShortened(object);
    expect(result).toMatch(/^a{40}-[0-9a-f]{12}$/);
    expect(result.length).toBe(53);
    // The first 12 hex digits of the SHA-256 of the name, as helm-controller
    // computes the storage name.
    expect(result).toBe(`${"a".repeat(40)}-11ee391211c6`);
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
  test("formats the chart source ref", () => {
    const object = {
      spec: { chart: { spec: { sourceRef: { kind: "HelmRepository", namespace: "flux-system", name: "repo" } } } },
    } as unknown as HelmRelease;
    expect(HelmRelease.getSourceRefText(object)).toBe("HelmRepository: flux-system/repo");
  });

  test("falls back to chartRef when there is no inline chart", () => {
    const object = {
      spec: { chartRef: { kind: "OCIRepository", name: "oci" } },
    } as unknown as HelmRelease;
    expect(HelmRelease.getSourceRefText(object)).toBe("OCIRepository: oci");
  });

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
