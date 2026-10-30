import { Renderer } from "@freelensapp/extensions";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  ArtifactGenerator,
  type InventoryEntry,
  type SourceReference,
  sourceWatcherReconcileAnnotation,
} from "./artifactgenerator-v1beta1";

// The parts of a host API that the code under test reads.
function fakeApi(kind: string, apiGroup: string, apiVersion: string, resource: string) {
  const apiVersionWithGroup = `${apiGroup}/${apiVersion}`;
  return {
    kind,
    apiGroup,
    apiVersion,
    apiVersionWithGroup,
    formatUrlForNotListing: ({ name, namespace }: { name?: string; namespace?: string }) =>
      `/apis/${apiVersionWithGroup}/namespaces/${namespace}/${resource}/${name}`,
  };
}

// Registers the APIs in the host's registry, as the host does for every resource the cluster serves.
function serveApis(...apis: ReturnType<typeof fakeApi>[]) {
  vi.spyOn(Renderer.K8sApi.apiManager, "getApi").mockImplementation(
    (callback) => apis.find((api) => typeof callback === "function" && callback(api as never)) as never,
  );
}

const artifactGenerator = () =>
  ({ metadata: { name: "podinfo", namespace: "fluxcd-test" } }) as unknown as ArtifactGenerator;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ArtifactGenerator", () => {
  test("has the group, version, plural and short name of the CRD", () => {
    expect(ArtifactGenerator.kind).toBe("ArtifactGenerator");
    expect(ArtifactGenerator.namespaced).toBe(true);
    expect(ArtifactGenerator.apiBase).toBe("/apis/source.extensions.fluxcd.io/v1beta1/artifactgenerators");
    expect(ArtifactGenerator.crd).toMatchObject({
      apiVersions: ["source.extensions.fluxcd.io/v1beta1"],
      plural: "artifactgenerators",
      singular: "artifactgenerator",
      shortNames: ["ag"],
    });
  });
});

describe("sourceWatcherReconcileAnnotation", () => {
  test("is ReconcileAnnotation of source-watcher", () => {
    expect(sourceWatcherReconcileAnnotation).toBe("source.extensions.fluxcd.io/reconcile");
  });
});

describe("ArtifactGenerator.getSourceRefText", () => {
  test("formats kind and name, with the namespace when present", () => {
    const source: SourceReference = { alias: "podinfo", kind: "GitRepository", name: "podinfo" };
    expect(ArtifactGenerator.getSourceRefText(source)).toBe("GitRepository: podinfo");
    expect(ArtifactGenerator.getSourceRefText({ ...source, namespace: "flux-system" })).toBe(
      "GitRepository: flux-system/podinfo",
    );
  });
});

describe("ArtifactGenerator.getSourceRefUrl", () => {
  test("links a source to the version the cluster serves for its kind, in the namespace of the object", () => {
    serveApis(
      fakeApi("GitRepository", "source.toolkit.fluxcd.io", "v1beta2", "gitrepositories"),
      fakeApi("GitRepository", "source.toolkit.fluxcd.io", "v1", "gitrepositories"),
    );
    const source: SourceReference = { alias: "podinfo", kind: "GitRepository", name: "podinfo" };
    expect(ArtifactGenerator.getSourceRefUrl(source, artifactGenerator())).toBe(
      "/apis/source.toolkit.fluxcd.io/v1/namespaces/fluxcd-test/gitrepositories/podinfo",
    );
  });

  test("links a source in another namespace to that namespace", () => {
    serveApis(fakeApi("OCIRepository", "source.toolkit.fluxcd.io", "v1", "ocirepositories"));
    const source: SourceReference = { alias: "app", kind: "OCIRepository", name: "app", namespace: "flux-system" };
    expect(ArtifactGenerator.getSourceRefUrl(source, artifactGenerator())).toBe(
      "/apis/source.toolkit.fluxcd.io/v1/namespaces/flux-system/ocirepositories/app",
    );
  });
});

describe("ArtifactGenerator.getInventoryRefUrl", () => {
  test("links an inventory entry without a kind to its ExternalArtifact", () => {
    serveApis(fakeApi("ExternalArtifact", "source.toolkit.fluxcd.io", "v1", "externalartifacts"));
    const entry: InventoryEntry = {
      name: "podinfo-manifests",
      namespace: "fluxcd-test",
      digest: "sha256:abc",
      filename: "abc.tar.gz",
    };
    expect(ArtifactGenerator.getInventoryKind(entry)).toBe("ExternalArtifact");
    expect(ArtifactGenerator.getInventoryRefUrl(entry, artifactGenerator())).toBe(
      "/apis/source.toolkit.fluxcd.io/v1/namespaces/fluxcd-test/externalartifacts/podinfo-manifests",
    );
  });

  test("links a Namespace entry to the Namespace of the core group", () => {
    const namespaceApi = {
      kind: "Namespace",
      apiVersionWithGroup: "v1",
      formatUrlForNotListing: ({ name }: { name?: string }) => `/api/v1/namespaces/${name}`,
    };
    vi.spyOn(Renderer.K8sApi.apiManager, "getApi").mockImplementation((callback) =>
      typeof callback === "function" && callback(namespaceApi as never) ? (namespaceApi as never) : undefined,
    );
    const entry: InventoryEntry = { kind: "Namespace", name: "team-a", digest: "sha256:abc" };
    expect(ArtifactGenerator.getInventoryKind(entry)).toBe("Namespace");
    expect(ArtifactGenerator.getInventoryRefUrl(entry, artifactGenerator())).toBe("/api/v1/namespaces/team-a");
  });
});
