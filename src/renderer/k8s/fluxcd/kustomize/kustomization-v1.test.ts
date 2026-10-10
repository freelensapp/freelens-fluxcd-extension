import { Renderer } from "@freelensapp/extensions";
import { afterEach, describe, expect, test, vi } from "vitest";
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("links a source ref without apiVersion to the source API the cluster serves", () => {
    const gitRepositoryApi = {
      kind: "GitRepository",
      apiGroup: "source.toolkit.fluxcd.io",
      apiVersion: "v1",
      apiVersionWithGroup: "source.toolkit.fluxcd.io/v1",
      formatUrlForNotListing: ({ name, namespace }: { name?: string; namespace?: string }) =>
        `/apis/source.toolkit.fluxcd.io/v1/namespaces/${namespace}/gitrepositories/${name}`,
    };
    vi.spyOn(Renderer.K8sApi.apiManager, "getApi").mockImplementation((callback) =>
      typeof callback === "function" && callback(gitRepositoryApi as never) ? (gitRepositoryApi as never) : undefined,
    );
    const object = {
      metadata: { namespace: "fluxcd-test" },
      spec: { sourceRef: { kind: "GitRepository", name: "podinfo" } },
    } as unknown as Kustomization;
    expect(Kustomization.getSourceRefUrl(object)).toBe(
      "/apis/source.toolkit.fluxcd.io/v1/namespaces/fluxcd-test/gitrepositories/podinfo",
    );
  });
});
