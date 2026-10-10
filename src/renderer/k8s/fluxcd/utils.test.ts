import { Renderer } from "@freelensapp/extensions";
import { afterEach, describe, expect, test, vi } from "vitest";
import { compareApiVersions, getRefUrl, getServedApiVersion, withServedApiVersion } from "./utils";

import type { NamespacedObjectKindReference } from "./types";

type KubeObject = Renderer.K8sApi.KubeObject;

// The parts of a host API that the code under test reads.
function fakeApi(kind: string, apiGroup: string, apiVersion: string, resource: string) {
  const apiVersionWithGroup = apiGroup ? `${apiGroup}/${apiVersion}` : apiVersion;
  const apiPrefix = apiGroup ? "/apis" : "/api";
  return {
    kind,
    apiGroup,
    apiVersion,
    apiVersionWithGroup,
    formatUrlForNotListing: ({ name, namespace }: { name?: string; namespace?: string }) =>
      `${apiPrefix}/${apiVersionWithGroup}${namespace ? `/namespaces/${namespace}` : ""}/${resource}/${name}`,
  };
}

// Registers the APIs in the host's registry, as the host does for every resource the cluster serves.
function serveApis(...apis: ReturnType<typeof fakeApi>[]) {
  vi.spyOn(Renderer.K8sApi.apiManager, "getApi").mockImplementation(
    (callback) => apis.find((api) => typeof callback === "function" && callback(api as never)) as never,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("compareApiVersions", () => {
  test("orders the versions as Kubernetes gives them priority", () => {
    const versions = ["v1beta1", "v1", "v1alpha1", "v2beta1", "v2", "v1beta2", "other"];
    expect(versions.sort(compareApiVersions)).toEqual([
      "v2",
      "v1",
      "v2beta1",
      "v1beta2",
      "v1beta1",
      "v1alpha1",
      "other",
    ]);
  });
});

describe("getServedApiVersion", () => {
  test("returns the newest served version of a Flux kind, in its own group only", () => {
    serveApis(
      fakeApi("Bucket", "s3.example.com", "v2", "buckets"),
      fakeApi("Bucket", "source.toolkit.fluxcd.io", "v1beta2", "buckets"),
      fakeApi("Bucket", "source.toolkit.fluxcd.io", "v1", "buckets"),
    );
    expect(getServedApiVersion("Bucket")).toBe("source.toolkit.fluxcd.io/v1");
  });

  test("falls back to an older version when the newer ones are not served", () => {
    serveApis(fakeApi("GitRepository", "source.toolkit.fluxcd.io", "v1beta2", "gitrepositories"));
    expect(getServedApiVersion("GitRepository")).toBe("source.toolkit.fluxcd.io/v1beta2");
  });

  test("looks up any other kind by its name", () => {
    serveApis(fakeApi("Service", "", "v1", "services"), fakeApi("Deployment", "apps", "v1", "deployments"));
    expect(getServedApiVersion("Deployment")).toBe("apps/v1");
    expect(getServedApiVersion("Service")).toBe("v1");
  });

  test("returns undefined when the kind has no API", () => {
    serveApis(fakeApi("GitRepository", "source.toolkit.fluxcd.io", "v1", "gitrepositories"));
    expect(getServedApiVersion("OCIRepository")).toBeUndefined();
  });
});

describe("withServedApiVersion", () => {
  test("fills in the served apiVersion of a reference without one", () => {
    serveApis(fakeApi("GitRepository", "source.toolkit.fluxcd.io", "v1", "gitrepositories"));
    expect(withServedApiVersion({ kind: "GitRepository", name: "app" })).toEqual({
      apiVersion: "source.toolkit.fluxcd.io/v1",
      kind: "GitRepository",
      name: "app",
    });
  });

  test("keeps the apiVersion of a reference that has one", () => {
    serveApis(fakeApi("GitRepository", "source.toolkit.fluxcd.io", "v1", "gitrepositories"));
    const ref: NamespacedObjectKindReference = {
      apiVersion: "source.toolkit.fluxcd.io/v1beta2",
      kind: "GitRepository",
      name: "app",
    };
    expect(withServedApiVersion(ref)).toBe(ref);
  });

  test("leaves a reference without kind, or without a served API, unchanged", () => {
    serveApis();
    const local = { name: "app" };
    const unserved = { kind: "GitRepository", name: "app" };
    expect(withServedApiVersion(local)).toBe(local);
    expect(withServedApiVersion(unserved)).toBe(unserved);
    expect(withServedApiVersion(undefined)).toBeUndefined();
  });
});

describe("getRefUrl", () => {
  const parent = { metadata: { namespace: "flux-system" } } as unknown as KubeObject;

  test("links a source reference without apiVersion to the API the cluster serves", () => {
    serveApis(
      fakeApi("GitRepository", "source.toolkit.fluxcd.io", "v1beta2", "gitrepositories"),
      fakeApi("GitRepository", "source.toolkit.fluxcd.io", "v1", "gitrepositories"),
    );
    expect(getRefUrl({ kind: "GitRepository", name: "app" }, parent)).toBe(
      "/apis/source.toolkit.fluxcd.io/v1/namespaces/flux-system/gitrepositories/app",
    );
  });

  test("links a health check of a core kind without apiVersion under /api", () => {
    serveApis(fakeApi("Service", "", "v1", "services"));
    expect(getRefUrl({ kind: "Service", name: "podinfo", namespace: "apps" }, parent)).toBe(
      "/api/v1/namespaces/apps/services/podinfo",
    );
  });
});
