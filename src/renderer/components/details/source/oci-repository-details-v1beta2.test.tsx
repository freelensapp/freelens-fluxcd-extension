// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OCIRepository } from "../../../k8s/fluxcd/source/ocirepository-v1beta2";
import { OCIRepositoryDetails } from "./oci-repository-details-v1beta2";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof OCIRepositoryDetails>[0];

const ociRepository = (layerSelector: Record<string, unknown>) =>
  new OCIRepository({
    apiVersion: "source.toolkit.fluxcd.io/v1beta2",
    kind: "OCIRepository",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { interval: "10m", url: "oci://ghcr.io/stefanprodan/manifests/podinfo", layerSelector },
  } as unknown as ConstructorParameters<typeof OCIRepository>[0]);

const renderDetails = (object: OCIRepository) =>
  render(<OCIRepositoryDetails {...({ object } as unknown as DetailsProps)} />);

const drawerItems = () => screen.getAllByTestId("drawer-item").map((item) => item.textContent);

describe("OCIRepositoryDetails v1beta2 OCI Layer Selector", () => {
  // Both fields of `OCILayerSelector` are optional: without `mediaType` source-controller selects the first layer,
  // and without `operation` it extracts the layer (`GetLayerOperation` of `OCIRepository`).
  it("hides the media type and shows the default operation of an empty layer selector", () => {
    renderDetails(ociRepository({}));

    expect(drawerItems().some((item) => item?.startsWith("Media type"))).toBe(false);
    expect(drawerItems()).toContain("Operation: extract");
  });

  it("shows the media type and the operation of the layer selector", () => {
    renderDetails(
      ociRepository({ mediaType: "application/vnd.cncf.helm.chart.content.v1.tar+gzip", operation: "copy" }),
    );

    expect(drawerItems()).toContain("Media type: application/vnd.cncf.helm.chart.content.v1.tar+gzip");
    expect(drawerItems()).toContain("Operation: copy");
  });
});
