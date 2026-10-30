// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExternalArtifact } from "../../../k8s/fluxcd/source/externalartifact-v1";
import { ExternalArtifactDetails } from "./external-artifact-details-v1";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type DetailsProps = Parameters<typeof ExternalArtifactDetails>[0];

const externalArtifact = (data: Record<string, unknown>) =>
  new ExternalArtifact({
    apiVersion: "source.toolkit.fluxcd.io/v1",
    kind: "ExternalArtifact",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    ...data,
  } as unknown as ConstructorParameters<typeof ExternalArtifact>[0]);

const renderDetails = (object: ExternalArtifact) =>
  render(<ExternalArtifactDetails {...({ object } as unknown as DetailsProps)} />);

describe("ExternalArtifactDetails", () => {
  it("links the source to the API the cluster serves for its kind, and shows the artifact with its digest", () => {
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

    renderDetails(
      externalArtifact({
        spec: { sourceRef: { kind: "ArtifactGenerator", name: "podinfo" } },
        status: {
          artifact: {
            path: "externalartifact/fluxcd-test/podinfo/sha256:abc.tar.gz",
            url: "http://source-watcher/externalartifact/fluxcd-test/podinfo/sha256:abc.tar.gz",
            revision: "latest@sha256:abc",
            digest: "sha256:abc",
          },
        },
      }),
    );

    const link = screen.getByRole("link", { name: "ArtifactGenerator: podinfo" });
    expect(link.getAttribute("href")).toBe(
      Renderer.Navigation.getDetailsUrl(
        "/apis/source.extensions.fluxcd.io/v1beta1/namespaces/fluxcd-test/artifactgenerators/podinfo",
      ),
    );
    expect(screen.getAllByTestId("drawer-item").map((item) => item.textContent)).toContain("Digest: sha256:abc");
  });

  it("shows the exported inputs as YAML", () => {
    renderDetails(externalArtifact({ status: { exportedInputs: { tenant: "team-a", replicas: 2 } } }));

    expect(screen.getByText("Exported Inputs")).toBeTruthy();
    expect(screen.getByText(/tenant: team-a/).textContent).toBe("replicas: 2\ntenant: team-a");
  });

  it("renders an object without a spec or a status", () => {
    renderDetails(externalArtifact({}));

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryAllByTestId("drawer-item")).toEqual([]);
  });
});
