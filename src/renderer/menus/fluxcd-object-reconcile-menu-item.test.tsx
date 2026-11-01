// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FluxCDObjectReconcileMenuItem,
  type FluxCDObjectReconcileMenuItemProps,
} from "./fluxcd-object-reconcile-menu-item";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

type MenuItemObject = NonNullable<FluxCDObjectReconcileMenuItemProps["object"]>;

class Resource extends Renderer.K8sApi.LensExtensionKubeObject<Renderer.K8sApi.KubeObjectMetadata, unknown, unknown> {}

const object = (spec?: Record<string, unknown>) =>
  ({
    kind: "GitRepository",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec,
  }) as unknown as MenuItemObject;

// The store of the resource, as the host returns it for a served version.
const serveStore = (patch = vi.fn(() => Promise.resolve())) => {
  vi.spyOn(Resource, "getStore").mockReturnValue({ patch } as never);
  return patch;
};

const renderItem = (object: MenuItemObject) =>
  render(<FluxCDObjectReconcileMenuItem object={object} resource={Resource} />);

describe("FluxCDObjectReconcileMenuItem", () => {
  it("requests a reconciliation with a merge patch of the requestedAt annotation", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-01T12:00:00.000Z"));
    const patch = serveStore();
    const item = object();

    renderItem(item);
    fireEvent.click(screen.getByText("Reconcile"));

    expect(patch).toHaveBeenCalledExactlyOnceWith(
      item,
      { metadata: { annotations: { "reconcile.fluxcd.io/requestedAt": "2026-11-01T12:00:00.000Z" } } },
      "merge",
    );
  });

  it.each([{}, { suspend: false }])("is enabled for an object with spec %j", (spec) => {
    serveStore();

    renderItem(object(spec));

    expect(screen.getByRole("menuitem").getAttribute("aria-disabled")).not.toBe("true");
  });

  it("is disabled for a suspended object, and does not patch it", () => {
    const patch = serveStore();

    renderItem(object({ suspend: true }));
    fireEvent.click(screen.getByText("Reconcile"));

    expect(screen.getByRole("menuitem").getAttribute("aria-disabled")).toBe("true");
    expect(patch).not.toHaveBeenCalled();
  });

  it("shows a failed patch as an error notification, and leaves no unhandled rejection", async () => {
    const unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);
    try {
      const error = vi.spyOn(Renderer.Component.Notifications, "error");
      serveStore(vi.fn(() => Promise.reject(new Error("forbidden"))));

      renderItem(object());
      fireEvent.click(screen.getByText("Reconcile"));

      await vi.waitFor(() =>
        expect(error).toHaveBeenCalledExactlyOnceWith(
          "Failed to reconcile GitRepository fluxcd-test/podinfo: forbidden",
        ),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off("unhandledRejection", unhandled);
    }
  });
});
