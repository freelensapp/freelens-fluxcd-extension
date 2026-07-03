import { describe, expect, test } from "vitest";
import { Kustomization } from "./kustomization-v1";

describe("Kustomization.getLastAppliedRevision", () => {
  test("returns undefined when there is no applied revision", () => {
    expect(Kustomization.getLastAppliedRevision({ status: {} } as unknown as Kustomization)).toBeUndefined();
  });

  test("strips a refs/heads/ prefix", () => {
    const object = { status: { lastAppliedRevision: "refs/heads/main@sha1:abc" } } as unknown as Kustomization;
    expect(Kustomization.getLastAppliedRevision(object)).toBe("main@sha1:abc");
  });
});

describe("Kustomization.getSourceRefText", () => {
  test("formats kind and name without a namespace", () => {
    const object = { spec: { sourceRef: { kind: "GitRepository", name: "app" } } } as unknown as Kustomization;
    expect(Kustomization.getSourceRefText(object)).toBe("GitRepository: app");
  });

  test("includes the namespace when present", () => {
    const object = {
      spec: { sourceRef: { kind: "GitRepository", namespace: "flux-system", name: "app" } },
    } as unknown as Kustomization;
    expect(Kustomization.getSourceRefText(object)).toBe("GitRepository: flux-system/app");
  });
});

describe("Kustomization.getSourceRefUrl", () => {
  test("builds an API link from the source ref", () => {
    const object = { spec: { sourceRef: { kind: "GitRepository", name: "app" } } } as unknown as Kustomization;
    expect(Kustomization.getSourceRefUrl(object)).toBe("/apis/GitRepository/app");
  });
});
