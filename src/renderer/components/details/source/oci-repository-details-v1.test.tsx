// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OCIRepository } from "../../../k8s/fluxcd/source/ocirepository-v1";
import { OCIRepositoryDetails } from "./oci-repository-details-v1";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof OCIRepositoryDetails>[0];
type MatchOIDCIdentity = { issuer: string; subject: string }[];

const ociRepository = (matchOIDCIdentity?: MatchOIDCIdentity) =>
  new OCIRepository({
    apiVersion: "source.toolkit.fluxcd.io/v1",
    kind: "OCIRepository",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: {
      interval: "10m",
      url: "oci://ghcr.io/stefanprodan/manifests/podinfo",
      verify: { provider: "cosign", matchOIDCIdentity },
    },
  } as unknown as ConstructorParameters<typeof OCIRepository>[0]);

const renderDetails = (object: OCIRepository) =>
  render(<OCIRepositoryDetails {...({ object } as unknown as DetailsProps)} />);

const oidcIdentityItems = () =>
  screen.queryAllByTestId("drawer-item").filter((item) => item.textContent?.startsWith("OIDC Identity"));

describe("OCIRepositoryDetails", () => {
  it.each([
    ["without", undefined],
    ["with an empty list of", []],
  ])("hides the OIDC Identity %s identities", (_, matchOIDCIdentity) => {
    renderDetails(ociRepository(matchOIDCIdentity));

    expect(oidcIdentityItems()).toEqual([]);
  });

  it("shows the OIDC Identity of each match", () => {
    renderDetails(
      ociRepository([
        {
          issuer: "https://token.actions.githubusercontent.com",
          subject: "^https://github.com/stefanprodan/podinfo.*$",
        },
      ]),
    );

    expect(oidcIdentityItems().map((item) => item.textContent)).toEqual([
      "OIDC Identity: MatchIssuer: https://token.actions.githubusercontent.comSubject: ^https://github.com/stefanprodan/podinfo.*$",
    ]);
  });
});

const ociRepositoryWithLayerSelector = (layerSelector: Record<string, unknown>) =>
  new OCIRepository({
    apiVersion: "source.toolkit.fluxcd.io/v1",
    kind: "OCIRepository",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { interval: "10m", url: "oci://ghcr.io/stefanprodan/manifests/podinfo", layerSelector },
  } as unknown as ConstructorParameters<typeof OCIRepository>[0]);

const drawerItems = () => screen.getAllByTestId("drawer-item").map((item) => item.textContent);

describe("OCIRepositoryDetails OCI Layer Selector", () => {
  // Both fields of `OCILayerSelector` are optional: without `mediaType` source-controller selects the first layer,
  // and without `operation` it extracts the layer (`GetLayerOperation` of `OCIRepository`).
  it("hides the media type and shows the default operation of an empty layer selector", () => {
    renderDetails(ociRepositoryWithLayerSelector({}));

    expect(drawerItems().some((item) => item?.startsWith("Media type"))).toBe(false);
    expect(drawerItems()).toContain("Operation: extract");
  });

  it("shows the media type and the operation of the layer selector", () => {
    renderDetails(
      ociRepositoryWithLayerSelector({
        mediaType: "application/vnd.cncf.helm.chart.content.v1.tar+gzip",
        operation: "copy",
      }),
    );

    expect(drawerItems()).toContain("Media type: application/vnd.cncf.helm.chart.content.v1.tar+gzip");
    expect(drawerItems()).toContain("Operation: copy");
  });
});
