// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ImageRepository } from "../../../k8s/fluxcd/image/imagerepository-v1";
import { ImageRepositoryDetails } from "./image-repository-details-v1";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof ImageRepositoryDetails>[0];

const imageRepository = (spec: Record<string, unknown>) =>
  new ImageRepository({
    apiVersion: "image.toolkit.fluxcd.io/v1",
    kind: "ImageRepository",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { image: "ghcr.io/stefanprodan/podinfo", interval: "5m", ...spec },
  } as unknown as ConstructorParameters<typeof ImageRepository>[0]);

const renderDetails = (object: ImageRepository) =>
  render(<ImageRepositoryDetails {...({ object } as unknown as DetailsProps)} />);

const drawerItems = () => screen.getAllByTestId("drawer-item").map((item) => item.textContent);

describe("ImageRepositoryDetails v1", () => {
  // `spec.timeout` is optional, and image-reflector-controller scans with the interval as timeout without it
  // (`GetTimeout` of `ImageRepository`).
  it("shows the interval as the default timeout", () => {
    renderDetails(imageRepository({}));

    expect(drawerItems()).toContain("Timeout: 5m");
  });

  it("shows the timeout of the spec", () => {
    renderDetails(imageRepository({ timeout: "30s" }));

    expect(drawerItems()).toContain("Timeout: 30s");
  });
});
