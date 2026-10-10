// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { act, cleanup, render, screen } from "@testing-library/react";
import { observable, runInAction } from "mobx";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type AvailableVersionPageProps, createAvailableVersionPage } from "./available-version";

// A minimal stub extension - only `name` is read by the pages below.
const extension = { name: "fluxcd-extension" } as Renderer.LensExtension;

// The stub's `getStore()` throws, as the host's does for a version that is not
// served. A test marks a version as served by spying on `getStore` of its class.
class AlertV1beta3 extends Renderer.K8sApi.LensExtensionKubeObject {}
class AlertV1beta2 extends Renderer.K8sApi.LensExtensionKubeObject {}

function serve(kubeObjectClass: typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>) {
  vi.spyOn(kubeObjectClass, "getStore").mockReturnValue({} as Renderer.K8sApi.KubeObjectStore<any, any, any>);
}

const AlertsPage = createAvailableVersionPage<AvailableVersionPageProps>("Alerts", [
  {
    kubeObjectClass: AlertV1beta3,
    PageComponent: ({ extension }) => <span>v1beta3 page of {extension.name}</span>,
    version: "v1beta3",
  },
  {
    kubeObjectClass: AlertV1beta2,
    PageComponent: ({ extension }) => <span>v1beta2 page of {extension.name}</span>,
    version: "v1beta2",
  },
]);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("createAvailableVersionPage", () => {
  it("renders the first version that has a store, with the extension", () => {
    serve(AlertV1beta3);
    serve(AlertV1beta2);

    render(<AlertsPage extension={extension} />);

    expect(screen.getByText("v1beta3 page of fluxcd-extension")).toBeDefined();
    expect(screen.queryByText(/v1beta2 page/)).toBeNull();
  });

  it("falls back to a later version when an earlier one has no store", () => {
    serve(AlertV1beta2);

    render(<AlertsPage extension={extension} />);

    expect(screen.getByText("v1beta2 page of fluxcd-extension")).toBeDefined();
  });

  it("renders the not available page with the versions it tried when no version has a store", () => {
    render(<AlertsPage extension={extension} />);

    expect(screen.getByText("Alerts Not Available")).toBeDefined();
    expect(screen.getByText("v1beta3, v1beta2")).toBeDefined();
  });

  it("renders the version's page once the host serves it after the first render", () => {
    // The host's `getStore()` reads its observable API registry. The spy reads an
    // observable in its place, so that serving the version is a change the page sees.
    const served = observable.box(false);
    vi.spyOn(AlertV1beta3, "getStore").mockImplementation(() => {
      if (!served.get()) {
        throw new Error("no API for AlertV1beta3");
      }
      return {} as Renderer.K8sApi.KubeObjectStore<any, any, any>;
    });

    render(<AlertsPage extension={extension} />);

    expect(screen.getByText("Alerts Not Available")).toBeDefined();

    act(() => runInAction(() => served.set(true)));

    expect(screen.getByText("v1beta3 page of fluxcd-extension")).toBeDefined();
    expect(screen.queryByText("Alerts Not Available")).toBeNull();
  });
});
