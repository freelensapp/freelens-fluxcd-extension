import { Renderer } from "@freelensapp/extensions";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ExternalArtifact } from "./externalartifact-v1";

describe("ExternalArtifact.getSourceRefText", () => {
  test("returns undefined without a source ref", () => {
    expect(ExternalArtifact.getSourceRefText({ spec: {} } as unknown as ExternalArtifact)).toBeUndefined();
  });

  test("formats kind and name without a namespace", () => {
    const object = {
      spec: { sourceRef: { kind: "ArtifactGenerator", name: "podinfo" } },
    } as unknown as ExternalArtifact;
    expect(ExternalArtifact.getSourceRefText(object)).toBe("ArtifactGenerator: podinfo");
  });

  test("includes the namespace when present", () => {
    const object = {
      spec: { sourceRef: { kind: "ArtifactGenerator", namespace: "flux-system", name: "podinfo" } },
    } as unknown as ExternalArtifact;
    expect(ExternalArtifact.getSourceRefText(object)).toBe("ArtifactGenerator: flux-system/podinfo");
  });
});

describe("ExternalArtifact.getSourceRefUrl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns undefined without a source ref", () => {
    expect(ExternalArtifact.getSourceRefUrl({ spec: {} } as unknown as ExternalArtifact)).toBeUndefined();
  });

  test("links a source ref with apiVersion to that version, in the namespace of the object", () => {
    const object = {
      metadata: { namespace: "fluxcd-test" },
      spec: {
        sourceRef: { apiVersion: "source.extensions.fluxcd.io/v1beta1", kind: "ArtifactGenerator", name: "podinfo" },
      },
    } as unknown as ExternalArtifact;
    expect(ExternalArtifact.getSourceRefUrl(object)).toBe(
      "/apis/source.extensions.fluxcd.io/v1beta1/namespaces/fluxcd-test/artifactgenerators/podinfo",
    );
  });

  test("links a source ref without apiVersion to the API the cluster serves for its kind", () => {
    const artifactGeneratorApi = {
      kind: "ArtifactGenerator",
      apiGroup: "source.extensions.fluxcd.io",
      apiVersion: "v1beta1",
      apiVersionWithGroup: "source.extensions.fluxcd.io/v1beta1",
      formatUrlForNotListing: ({ name, namespace }: { name?: string; namespace?: string }) =>
        `/apis/source.extensions.fluxcd.io/v1beta1/namespaces/${namespace}/artifactgenerators/${name}`,
    };
    vi.spyOn(Renderer.K8sApi.apiManager, "getApi").mockImplementation((callback) =>
      typeof callback === "function" && callback(artifactGeneratorApi as never)
        ? (artifactGeneratorApi as never)
        : undefined,
    );
    const object = {
      metadata: { namespace: "fluxcd-test" },
      spec: { sourceRef: { kind: "ArtifactGenerator", namespace: "flux-system", name: "podinfo" } },
    } as unknown as ExternalArtifact;
    expect(ExternalArtifact.getSourceRefUrl(object)).toBe(
      "/apis/source.extensions.fluxcd.io/v1beta1/namespaces/flux-system/artifactgenerators/podinfo",
    );
  });
});
