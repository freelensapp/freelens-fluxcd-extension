// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ImageRepository } from "../../../k8s/fluxcd/image/imagerepository-v1beta2";
import { ImageRepositoryDetails } from "./image-repository-details-v1beta2";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof ImageRepositoryDetails>[0];

const imageRepository = (status: Record<string, unknown>) =>
  new ImageRepository({
    apiVersion: "image.toolkit.fluxcd.io/v1beta2",
    kind: "ImageRepository",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { image: "ghcr.io/stefanprodan/podinfo", interval: "5m" },
    status,
  } as unknown as ConstructorParameters<typeof ImageRepository>[0]);

const renderDetails = (object: ImageRepository) =>
  render(<ImageRepositoryDetails {...({ object } as unknown as DetailsProps)} />);

const drawerItems = () => screen.getAllByTestId("drawer-item").map((item) => item.textContent);

describe("ImageRepositoryDetails v1beta2", () => {
  // `latestTags` is `omitempty` without a marker in v1beta2 of image-reflector-controller: a scan that found no tags
  // has none.
  it("renders a scan result without latestTags", () => {
    renderDetails(imageRepository({ lastScanResult: { tagCount: 0, scanTime: "2026-10-11T17:00:00Z" } }));

    expect(drawerItems()).toContain("Tag Count: 0");
    expect(drawerItems().some((item) => item?.startsWith("Latest Tags"))).toBe(false);
  });

  it("lists the latest tags of a scan result", () => {
    renderDetails(imageRepository({ lastScanResult: { tagCount: 2, latestTags: ["6.1.0", "6.0.0"] } }));

    expect(drawerItems()).toContain(": 6.1.0");
    expect(drawerItems()).toContain(": 6.0.0");
  });
});
