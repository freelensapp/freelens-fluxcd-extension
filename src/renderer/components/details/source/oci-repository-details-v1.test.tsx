// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OCIRepository } from "../../../k8s/fluxcd/source/ocirepository-v1";
import { OCIRepositoryDetails } from "./oci-repository-details-v1";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
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

  // A key joined from the issuer and the subject with `-` was the same for these two.
  it("renders matches whose issuer and subject join to the same text, with no React key error", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    renderDetails(
      ociRepository([
        { issuer: "https://issuer.example.com/a-b", subject: "c" },
        { issuer: "https://issuer.example.com/a", subject: "b-c" },
      ]),
    );

    expect(oidcIdentityItems().map((item) => item.textContent)).toEqual([
      "OIDC Identity: MatchIssuer: https://issuer.example.com/a-bSubject: cMatchIssuer: https://issuer.example.com/aSubject: b-c",
    ]);
    expect(error).not.toHaveBeenCalled();
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

const ociRepositoryWith = (spec: Record<string, unknown> = {}, status?: Record<string, unknown>) =>
  new OCIRepository({
    apiVersion: "source.toolkit.fluxcd.io/v1",
    kind: "OCIRepository",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { interval: "10m", url: "oci://ghcr.io/stefanprodan/manifests/podinfo", ...spec },
    status,
  } as unknown as ConstructorParameters<typeof OCIRepository>[0]);

// The text of each drawer item named `name`, nested ones included.
const namedItems = (name: string) => drawerItems().filter((text) => text?.startsWith(`${name}: `));

describe("OCIRepositoryDetails Last Handled Reconcile At", () => {
  it("hides the item without the field", () => {
    renderDetails(ociRepositoryWith());

    expect(namedItems("Last Handled Reconcile At")).toEqual([]);
  });

  it("shows the time of the last handled reconcile request", () => {
    renderDetails(ociRepositoryWith({}, { lastHandledReconcileAt: "2026-11-26T12:00:00Z" }));

    expect(namedItems("Last Handled Reconcile At")).toEqual(["Last Handled Reconcile At: 2026-11-26T12:00:00Z"]);
  });
});

describe("OCIRepositoryDetails URL and Source Ignore", () => {
  it("shows the URL and hides the Source Ignore without the field", () => {
    renderDetails(ociRepositoryWith());

    expect(namedItems("URL")).toEqual(["URL: oci://ghcr.io/stefanprodan/manifests/podinfo"]);
    expect(namedItems("Source Ignore")).toEqual([]);
  });

  it("shows the Source Ignore", () => {
    renderDetails(ociRepositoryWith({ ignore: "/*\n!/deploy" }));

    expect(namedItems("Source Ignore")).toEqual(["Source Ignore: /*\n!/deploy"]);
  });
});

describe("OCIRepositoryDetails observed fields", () => {
  it("hides the observed fields and the Latest Artifact URL without the status", () => {
    renderDetails(ociRepositoryWith());

    expect(namedItems("Observed Source Ignore")).toEqual([]);
    expect(screen.queryByText("Observed OCI Layer Selector")).toBeNull();
    expect(namedItems("Latest Artifact URL")).toEqual([]);
  });

  it("shows the Observed Source Ignore and the Latest Artifact URL", () => {
    renderDetails(
      ociRepositoryWith(
        {},
        {
          observedIgnore: "/*\n!/deploy",
          url: "http://source-controller.flux-system.svc.cluster.local./ocirepository/fluxcd-test/podinfo/latest.tar.gz",
        },
      ),
    );

    expect(namedItems("Observed Source Ignore")).toEqual(["Observed Source Ignore: /*\n!/deploy"]);
    expect(namedItems("Latest Artifact URL")).toEqual([
      "Latest Artifact URL: http://source-controller.flux-system.svc.cluster.local./ocirepository/fluxcd-test/podinfo/latest.tar.gz",
    ]);
  });

  it("hides the media type and shows the default operation of an empty observed layer selector", () => {
    renderDetails(ociRepositoryWith({}, { observedLayerSelector: {} }));

    expect(screen.getByText("Observed OCI Layer Selector")).toBeTruthy();
    expect(namedItems("Media type")).toEqual([]);
    expect(namedItems("Operation")).toEqual(["Operation: extract"]);
  });

  it("shows the media type and the operation of the observed layer selector", () => {
    renderDetails(
      ociRepositoryWith(
        {},
        {
          observedLayerSelector: {
            mediaType: "application/vnd.cncf.helm.chart.content.v1.tar+gzip",
            operation: "copy",
          },
        },
      ),
    );

    expect(namedItems("Media type")).toEqual(["Media type: application/vnd.cncf.helm.chart.content.v1.tar+gzip"]);
    expect(namedItems("Operation")).toEqual(["Operation: copy"]);
  });
});
