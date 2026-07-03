import { describe, expect, test } from "vitest";
import { HelmRelease } from "./helmrelease-v2";

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
  });
});

describe("HelmRelease.getHelmChartName", () => {
  test("joins the chart namespace and the object name", () => {
    const object = {
      metadata: { name: "hr" },
      spec: { chart: { spec: { sourceRef: { namespace: "flux-system" } } } },
    } as unknown as HelmRelease;
    expect(HelmRelease.getHelmChartName(object)).toBe("flux-system-hr");
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
});
