// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Kustomization as Kustomization_v1beta1 } from "../../../k8s/fluxcd/kustomize/kustomization-v1beta1";
import { Kustomization as Kustomization_v1beta2 } from "../../../k8s/fluxcd/kustomize/kustomization-v1beta2";
import { KustomizationDetails as KustomizationDetails_v1beta1 } from "./kustomization-details-v1beta1";
import { KustomizationDetails as KustomizationDetails_v1beta2 } from "./kustomization-details-v1beta2";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// `patchesJson6902` and `images` are `+optional` in `KustomizationSpec` of kustomize-controller v1.6.1
// (`api/v1beta1`) and v1.7.3 (`api/v1beta2`), the last releases that serve these versions.
const versions = [
  {
    apiVersion: "kustomize.toolkit.fluxcd.io/v1beta1",
    Kustomization: Kustomization_v1beta1,
    KustomizationDetails: KustomizationDetails_v1beta1,
  },
  {
    apiVersion: "kustomize.toolkit.fluxcd.io/v1beta2",
    Kustomization: Kustomization_v1beta2,
    KustomizationDetails: KustomizationDetails_v1beta2,
  },
] as const;

describe.each(versions)("KustomizationDetails $apiVersion", ({ apiVersion, Kustomization, KustomizationDetails }) => {
  const renderDetails = (spec: Record<string, unknown>) => {
    vi.spyOn(Kustomization, "getStore").mockReturnValue({ getByName: () => undefined } as never);
    const object = new Kustomization({
      apiVersion,
      kind: "Kustomization",
      metadata: { name: "podinfo", namespace: "fluxcd-test" },
      spec: { interval: "10m", prune: true, sourceRef: { kind: "GitRepository", name: "podinfo" }, ...spec },
    } as never);
    const Details = KustomizationDetails as React.FC<{ object: typeof object }>;

    return render(<Details object={object} />);
  };

  it("renders a spec without patchesJson6902 and images", () => {
    renderDetails({});

    expect(screen.getByText("GitRepository: podinfo")).toBeTruthy();
    expect(screen.queryByText("Patches: RFC 6902")).toBeNull();
    expect(screen.queryByText("Images")).toBeNull();
  });

  it("renders the patchesJson6902 and images of a spec", () => {
    renderDetails({
      patchesJson6902: [
        {
          target: { kind: "Deployment", name: "podinfo" },
          patch: [{ op: "replace", path: "/spec/replicas", value: 2 }],
        },
      ],
      images: [{ name: "podinfo", newTag: "6.1.0" }],
    });

    expect(screen.getByText("Patches: RFC 6902")).toBeTruthy();
    expect(screen.getByText("Images")).toBeTruthy();
    expect(screen.getAllByTestId("drawer-item").map((item) => item.textContent)).toContain("New Tag: 6.1.0");
  });
});
