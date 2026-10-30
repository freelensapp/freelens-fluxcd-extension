// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArtifactGenerator } from "../../../k8s/fluxcd/source/artifactgenerator-v1beta1";
import { ArtifactGeneratorDetails } from "./artifact-generator-details-v1beta1";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type DetailsProps = Parameters<typeof ArtifactGeneratorDetails>[0];

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

const artifactGenerator = (data: Record<string, unknown>) =>
  new ArtifactGenerator({
    apiVersion: "source.extensions.fluxcd.io/v1beta1",
    kind: "ArtifactGenerator",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    ...data,
  } as unknown as ConstructorParameters<typeof ArtifactGenerator>[0]);

const renderDetails = (object: ArtifactGenerator) =>
  render(<ArtifactGeneratorDetails {...({ object } as unknown as DetailsProps)} />);

const drawerItems = () => screen.queryAllByTestId("drawer-item").map((item) => item.textContent);

describe("ArtifactGeneratorDetails", () => {
  it("links each source, with its alias, to the API the cluster serves for its kind", () => {
    serveApis(
      fakeApi("GitRepository", "source.toolkit.fluxcd.io", "v1", "gitrepositories"),
      fakeApi("OCIRepository", "source.toolkit.fluxcd.io", "v1", "ocirepositories"),
    );

    renderDetails(
      artifactGenerator({
        spec: {
          sources: [
            { alias: "podinfo", kind: "GitRepository", name: "podinfo" },
            { alias: "charts", kind: "OCIRepository", name: "charts", namespace: "flux-system" },
          ],
          artifacts: [],
        },
      }),
    );

    expect(screen.getByRole("link", { name: "GitRepository: podinfo" }).getAttribute("href")).toBe(
      Renderer.Navigation.getDetailsUrl(
        "/apis/source.toolkit.fluxcd.io/v1/namespaces/fluxcd-test/gitrepositories/podinfo",
      ),
    );
    expect(screen.getByRole("link", { name: "OCIRepository: flux-system/charts" }).getAttribute("href")).toBe(
      Renderer.Navigation.getDetailsUrl(
        "/apis/source.toolkit.fluxcd.io/v1/namespaces/flux-system/ocirepositories/charts",
      ),
    );
    expect(drawerItems()).toContain("@podinfo: GitRepository: podinfo");
    expect(drawerItems()).toContain("@charts: OCIRepository: flux-system/charts");
  });

  it("shows the output artifacts with their copy operations", () => {
    renderDetails(
      artifactGenerator({
        spec: {
          sources: [],
          pathPattern: "@podinfo/kustomize/{app}",
          artifacts: [
            {
              name: "podinfo-{app}",
              revision: "@podinfo",
              originRevision: "@podinfo",
              copy: [
                { from: "@podinfo/kustomize/{app}/**", to: "@artifact/", exclude: ["*.md", "*.txt"] },
                { from: "@podinfo/values.yaml", to: "@artifact/values.yaml", strategy: "Merge" },
              ],
            },
          ],
        },
      }),
    );

    expect(drawerItems()).toEqual(
      expect.arrayContaining([
        "Path Pattern: @podinfo/kustomize/{app}",
        "Name: podinfo-{app}",
        "Revision: @podinfo",
        "Origin Revision: @podinfo",
      ]),
    );
    expect(screen.getAllByRole("row").map((row) => row.textContent)).toEqual([
      "@podinfo/kustomize/{app}/**@artifact/Overwrite*.md, *.txtNo",
      "@podinfo/values.yaml@artifact/values.yamlMerge-No",
    ]);
  });

  it("shows the managed namespaces, the target namespace of an artifact and an optional copy", () => {
    renderDetails(
      artifactGenerator({
        spec: {
          sources: [],
          serviceAccountName: "generator",
          managedNamespaces: { allowedNames: ["ns.startsWith('team-')"], prune: true },
          artifacts: [
            {
              name: "podinfo",
              namespace: "team-a",
              inputsFrom: "@podinfo/inputs.yaml",
              copy: [{ from: "@podinfo/README.md", to: "@artifact/", optional: true }],
            },
          ],
        },
      }),
    );

    expect(drawerItems()).toEqual(
      expect.arrayContaining([
        "Service Account: generator",
        "Allowed Names: ns.startsWith('team-')",
        "Prune: True",
        "Namespace: team-a",
        "Inputs From: @podinfo/inputs.yaml",
      ]),
    );
    expect(screen.getByRole("row").textContent).toBe("@podinfo/README.md@artifact/Overwrite-Yes");
  });

  it("links each inventory entry to its ExternalArtifact, with its digest and filename", () => {
    serveApis(fakeApi("ExternalArtifact", "source.toolkit.fluxcd.io", "v1", "externalartifacts"));

    renderDetails(
      artifactGenerator({
        spec: { sources: [], artifacts: [] },
        status: {
          inventory: [{ name: "podinfo", namespace: "fluxcd-test", digest: "sha256:abc", filename: "abc.tar.gz" }],
          observedSourcesDigest: "sha256:def",
        },
      }),
    );

    expect(screen.getByRole("link", { name: "podinfo" }).getAttribute("href")).toBe(
      Renderer.Navigation.getDetailsUrl(
        "/apis/source.toolkit.fluxcd.io/v1/namespaces/fluxcd-test/externalartifacts/podinfo",
      ),
    );
    expect(screen.getByRole("row").textContent).toBe("ExternalArtifactpodinfofluxcd-testsha256:abcabc.tar.gz");
    expect(drawerItems()).toContain("Observed Sources Digest: sha256:def");
  });

  it("shows a managed Namespace in the inventory, without a namespace or a filename", () => {
    renderDetails(
      artifactGenerator({
        spec: { sources: [], artifacts: [] },
        status: { inventory: [{ kind: "Namespace", name: "team-a", digest: "sha256:abc" }] },
      }),
    );

    expect(screen.getByRole("row").textContent).toBe("Namespaceteam-a-sha256:abc-");
  });

  it("shows the common metadata and whether the annotation disables the reconciliation", () => {
    renderDetails(
      artifactGenerator({
        metadata: {
          name: "podinfo",
          namespace: "fluxcd-test",
          annotations: { "source.extensions.fluxcd.io/reconcile": "disabled" },
        },
        spec: {
          commonMetadata: { labels: { app: "podinfo" }, annotations: { team: "dev" } },
          sources: [],
          artifacts: [],
        },
      }),
    );

    expect(drawerItems()).toEqual(
      expect.arrayContaining(["Resumed: False", "Common Labels: app=podinfo", "Common Annotations: team=dev"]),
    );
  });

  it("renders an object without a spec or a status", () => {
    renderDetails(artifactGenerator({}));

    expect(screen.queryByRole("link")).toBeNull();
    expect(drawerItems()).toEqual(["Resumed: True"]);
  });
});
