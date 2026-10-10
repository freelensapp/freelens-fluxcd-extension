// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FluxCDEvents } from "./fluxcd-events";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function event(name: string, apiVersion: string, creationTimestamp: number) {
  return {
    involvedObject: { apiVersion, kind: "Kustomization", name },
    getName: () => name,
    getCreationTimestamp: () => creationTimestamp,
  } as unknown as Renderer.K8sApi.KubeEvent;
}

describe("FluxCDEvents", () => {
  // The stub's list layout calls `getItems` in a computed value and
  // `customizeHeader` in the render of its header, as the host does, where
  // mobx-react 10 throws on a read of the component's `this.props`.
  it("renders the newest FluxCD events up to the compact limit", () => {
    vi.spyOn(Renderer.K8sApi.eventStore, "contextItems", "get").mockReturnValue([
      event("old", "kustomize.toolkit.fluxcd.io/v1", 1000),
      event("pod", "v1", 4000),
      event("newest", "source.toolkit.fluxcd.io/v1", 3000),
      event("newer", "helm.toolkit.fluxcd.io/v2", 2000),
    ]);

    render(<FluxCDEvents compact compactLimit={2} />);

    expect(screen.getAllByTestId("item").map((item) => item.textContent)).toEqual(["newest", "newer"]);
    expect(screen.getByTestId("header").textContent).toBe("(2 of 3)");
  });
});
