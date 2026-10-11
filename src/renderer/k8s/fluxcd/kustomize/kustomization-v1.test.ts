import { Renderer } from "@freelensapp/extensions";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  type CrossNamespaceSourceReference,
  type CrossNamespaceSourceReferenceKind,
  Kustomization,
} from "./kustomization-v1";

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

describe("Kustomization sourceRef", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("takes the kinds of the upstream enum only", () => {
    const kinds: CrossNamespaceSourceReferenceKind[] = ["OCIRepository", "GitRepository", "Bucket", "ExternalArtifact"];
    expect(kinds).toHaveLength(4);
    // @ts-expect-error a HelmChart is not a source of a Kustomization
    const helmChart: CrossNamespaceSourceReferenceKind = "HelmChart";
    expect(helmChart).toBe("HelmChart");
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
    const sourceRef: CrossNamespaceSourceReference = {
      kind: "ExternalArtifact",
      namespace: "flux-system",
      name: "podinfo",
    };
    const object = { metadata: { namespace: "fluxcd-test" }, spec: { sourceRef } } as unknown as Kustomization;

    expect(Kustomization.getSourceRefText(object)).toBe("ExternalArtifact: flux-system/podinfo");
    expect(Kustomization.getSourceRefUrl(object)).toBe(
      "/apis/source.toolkit.fluxcd.io/v1/namespaces/flux-system/externalartifacts/podinfo",
    );
  });
});
