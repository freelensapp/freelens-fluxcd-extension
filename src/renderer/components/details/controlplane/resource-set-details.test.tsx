// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResourceSet } from "../../../k8s/fluxcd/controlplane/resourceset-v1";
import { ResourceSetDetails } from "./resource-set-details";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type DetailsProps = Parameters<typeof ResourceSetDetails>[0];

const resourceSet = (spec: Record<string, unknown>) =>
  new ResourceSet({
    apiVersion: "fluxcd.controlplane.io/v1",
    kind: "ResourceSet",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec,
  } as unknown as ConstructorParameters<typeof ResourceSet>[0]);

const renderDetails = (object: ResourceSet) =>
  render(<ResourceSetDetails {...({ object } as unknown as DetailsProps)} />);

describe("ResourceSetDetails", () => {
  it("links an entry of inputsFrom to its ResourceSetInputProvider, in the namespace of the ResourceSet", () => {
    renderDetails(resourceSet({ inputsFrom: [{ name: "podinfo-tags" }] }));

    expect(screen.getByRole("link", { name: "podinfo-tags" }).getAttribute("href")).toBe(
      Renderer.Navigation.getDetailsUrl(
        "/apis/fluxcd.controlplane.io/v1/namespaces/fluxcd-test/resourcesetinputproviders/podinfo-tags",
      ),
    );
  });

  it("links an entry of inputsFrom with the API version and kind it names", () => {
    renderDetails(
      resourceSet({
        inputsFrom: [{ apiVersion: "fluxcd.controlplane.io/v1", kind: "ResourceSetInputProvider", name: "branches" }],
      }),
    );

    expect(screen.getByRole("link", { name: "branches" }).getAttribute("href")).toBe(
      Renderer.Navigation.getDetailsUrl(
        "/apis/fluxcd.controlplane.io/v1/namespaces/fluxcd-test/resourcesetinputproviders/branches",
      ),
    );
  });

  it("shows no name for an entry of inputsFrom that selects its providers by labels", () => {
    renderDetails(resourceSet({ inputsFrom: [{ selector: { matchLabels: { app: "podinfo" } } }] }));

    expect(screen.queryByRole("link")).toBeNull();
    const items = screen.getAllByTestId("drawer-item").map((item) => item.textContent);
    expect(items).toContain("Match Labels: app=podinfo");
    expect(items.some((item) => item?.startsWith("Name: "))).toBe(false);
  });
});
