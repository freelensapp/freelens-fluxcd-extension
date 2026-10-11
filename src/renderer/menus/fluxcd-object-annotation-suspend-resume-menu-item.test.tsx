// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FluxCDObjectAnnotationSuspendResumeMenuItem,
  type FluxCDObjectAnnotationSuspendResumeMenuItemProps,
} from "./fluxcd-object-annotation-suspend-resume-menu-item";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type MenuItemObject = NonNullable<FluxCDObjectAnnotationSuspendResumeMenuItemProps["object"]>;

class Resource extends Renderer.K8sApi.LensExtensionKubeObject<Renderer.K8sApi.KubeObjectMetadata, unknown, unknown> {}

const object = (annotations?: Record<string, string>) =>
  ({ metadata: { name: "podinfo", namespace: "fluxcd-test", annotations } }) as unknown as MenuItemObject;

// The store of the resource, as the host returns it for a served version.
const serveStore = () => {
  const patch = vi.fn(() => Promise.resolve());
  vi.spyOn(Resource, "getStore").mockReturnValue({ patch } as never);
  return patch;
};

const renderItem = (object: MenuItemObject, annotation: string) =>
  render(<FluxCDObjectAnnotationSuspendResumeMenuItem object={object} resource={Resource} annotation={annotation} />);

describe("FluxCDObjectAnnotationSuspendResumeMenuItem", () => {
  it.each(["fluxcd.controlplane.io/reconcile", "source.extensions.fluxcd.io/reconcile"])(
    "suspends an object without %s by setting it to disabled",
    (annotation) => {
      const patch = serveStore();
      const item = object();

      renderItem(item, annotation);
      fireEvent.click(screen.getByText("Suspend"));

      expect(patch).toHaveBeenCalledExactlyOnceWith(
        item,
        { metadata: { annotations: { [annotation]: "disabled" } } },
        "merge",
      );
    },
  );

  it("resumes an object whose annotation is disabled by setting it to enabled", () => {
    const patch = serveStore();
    const annotation = "source.extensions.fluxcd.io/reconcile";
    const item = object({ [annotation]: "disabled" });

    renderItem(item, annotation);
    fireEvent.click(screen.getByText("Resume"));

    expect(patch).toHaveBeenCalledExactlyOnceWith(
      item,
      { metadata: { annotations: { [annotation]: "enabled" } } },
      "merge",
    );
  });

  // As IsDisabled of source-watcher and the Flux Operator: only `disabled`, in any case, suspends the object.
  it.each(["Disabled", "DISABLED"])("resumes an object whose annotation is %s", (value) => {
    serveStore();
    const annotation = "fluxcd.controlplane.io/reconcile";

    renderItem(object({ [annotation]: value }), annotation);

    expect(screen.getByText("Resume")).toBeTruthy();
    expect(screen.queryByText("Suspend")).toBeNull();
  });

  it.each(["enabled", "Enabled", "", "false"])("suspends an object whose annotation is %j", (value) => {
    serveStore();
    const annotation = "source.extensions.fluxcd.io/reconcile";

    renderItem(object({ [annotation]: value }), annotation);

    expect(screen.getByText("Suspend")).toBeTruthy();
    expect(screen.queryByText("Resume")).toBeNull();
  });

  it("reads the annotation it is given only", () => {
    serveStore();

    renderItem(object({ "fluxcd.controlplane.io/reconcile": "disabled" }), "source.extensions.fluxcd.io/reconcile");

    expect(screen.getByText("Suspend")).toBeTruthy();
    expect(screen.queryByText("Resume")).toBeNull();
  });
});
