// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1 } from "../../../k8s/fluxcd/image/imageupdateautomation-v1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1beta1 } from "../../../k8s/fluxcd/image/imageupdateautomation-v1beta1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1beta2 } from "../../../k8s/fluxcd/image/imageupdateautomation-v1beta2";
import { ImageUpdateAutomationDetails as ImageUpdateAutomationDetails_v1 } from "./image-update-automation-details-v1";
import { ImageUpdateAutomationDetails as ImageUpdateAutomationDetails_v1beta1 } from "./image-update-automation-details-v1beta1";
import { ImageUpdateAutomationDetails as ImageUpdateAutomationDetails_v1beta2 } from "./image-update-automation-details-v1beta2";

afterEach(() => {
  cleanup();
});

const drawerItems = () => screen.getAllByTestId("drawer-item").map((item) => item.textContent);

const spec = (update: Record<string, unknown>) => ({
  interval: "5m",
  sourceRef: { kind: "GitRepository", name: "podinfo" },
  update,
});

// The details of every version, each rendered with an object of its own version.
const versions = [
  {
    apiVersion: "image.toolkit.fluxcd.io/v1",
    renderDetails: (update: Record<string, unknown>) => {
      const object = new ImageUpdateAutomation_v1({
        apiVersion: "image.toolkit.fluxcd.io/v1",
        kind: "ImageUpdateAutomation",
        metadata: { name: "podinfo", namespace: "fluxcd-test" },
        spec: spec(update),
      } as unknown as ConstructorParameters<typeof ImageUpdateAutomation_v1>[0]);
      type DetailsProps = Parameters<typeof ImageUpdateAutomationDetails_v1>[0];
      render(<ImageUpdateAutomationDetails_v1 {...({ object } as unknown as DetailsProps)} />);
    },
  },
  {
    apiVersion: "image.toolkit.fluxcd.io/v1beta2",
    renderDetails: (update: Record<string, unknown>) => {
      const object = new ImageUpdateAutomation_v1beta2({
        apiVersion: "image.toolkit.fluxcd.io/v1beta2",
        kind: "ImageUpdateAutomation",
        metadata: { name: "podinfo", namespace: "fluxcd-test" },
        spec: spec(update),
      } as unknown as ConstructorParameters<typeof ImageUpdateAutomation_v1beta2>[0]);
      type DetailsProps = Parameters<typeof ImageUpdateAutomationDetails_v1beta2>[0];
      render(<ImageUpdateAutomationDetails_v1beta2 {...({ object } as unknown as DetailsProps)} />);
    },
  },
  {
    apiVersion: "image.toolkit.fluxcd.io/v1beta1",
    renderDetails: (update: Record<string, unknown>) => {
      const object = new ImageUpdateAutomation_v1beta1({
        apiVersion: "image.toolkit.fluxcd.io/v1beta1",
        kind: "ImageUpdateAutomation",
        metadata: { name: "podinfo", namespace: "fluxcd-test" },
        spec: spec(update),
      } as unknown as ConstructorParameters<typeof ImageUpdateAutomation_v1beta1>[0]);
      type DetailsProps = Parameters<typeof ImageUpdateAutomationDetails_v1beta1>[0];
      render(<ImageUpdateAutomationDetails_v1beta1 {...({ object } as unknown as DetailsProps)} />);
    },
  },
];

describe.each(versions)("ImageUpdateAutomationDetails $apiVersion", ({ renderDetails }) => {
  // `path` of `UpdateStrategy` is optional, and image-automation-controller updates the root of the repository
  // without it.
  it("shows the root of the repository as the default path", () => {
    renderDetails({ strategy: "Setters" });

    expect(drawerItems()).toContain("Path: ./");
  });

  it("shows the path of the update", () => {
    renderDetails({ strategy: "Setters", path: "./clusters/my-cluster" });

    expect(drawerItems()).toContain("Path: ./clusters/my-cluster");
  });
});
