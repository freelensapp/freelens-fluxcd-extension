// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FluxCDObjectSpecSuspendResumeMenuItem,
  type FluxCDObjectSpecSuspendResumeMenuItemProps,
} from "./fluxcd-object-spec-suspend-resume-menu-item";

import type { FluxCDKubeObjectSpecWithSuspend } from "../k8s/fluxcd/types";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type MenuItemObject = NonNullable<FluxCDObjectSpecSuspendResumeMenuItemProps["object"]>;

class Resource extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  FluxCDKubeObjectSpecWithSuspend
> {}

const object = (spec: FluxCDKubeObjectSpecWithSuspend) =>
  ({
    kind: "Kustomization",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec,
  }) as unknown as MenuItemObject;

// The store of the resource, as the host returns it for a served version.
const serveStore = (patch = vi.fn(() => Promise.resolve())) => {
  vi.spyOn(Resource, "getStore").mockReturnValue({ patch } as never);
  return patch;
};

const renderItem = (object: MenuItemObject) =>
  render(<FluxCDObjectSpecSuspendResumeMenuItem object={object} resource={Resource} />);

// The host's API rejects a failed request with a JsonApiErrorParsed, which is no Error and whose `toString()` gives
// the messages of the response.
class JsonApiErrorParsed {
  constructor(private readonly messages: string[]) {}

  toString() {
    return this.messages.join("\n");
  }
}

describe("FluxCDObjectSpecSuspendResumeMenuItem", () => {
  it.each([{}, { suspend: false }])("suspends an object with spec %j by setting spec.suspend to true", (spec) => {
    const patch = serveStore();
    const item = object(spec);

    renderItem(item);
    fireEvent.click(screen.getByText("Suspend"));

    expect(screen.queryByText("Resume")).toBeNull();
    expect(patch).toHaveBeenCalledExactlyOnceWith(item, { spec: { suspend: true } }, "merge");
  });

  it("resumes a suspended object by setting spec.suspend to false", () => {
    const patch = serveStore();
    const item = object({ suspend: true });

    renderItem(item);
    fireEvent.click(screen.getByText("Resume"));

    expect(screen.queryByText("Suspend")).toBeNull();
    expect(patch).toHaveBeenCalledExactlyOnceWith(item, { spec: { suspend: false } }, "merge");
  });

  it.each([
    { spec: {}, action: "Suspend", reason: new Error("conflict"), message: "conflict" },
    {
      spec: { suspend: true },
      action: "Resume",
      reason: new JsonApiErrorParsed(["kustomizations.kustomize.toolkit.fluxcd.io is forbidden"]),
      message: "kustomizations.kustomize.toolkit.fluxcd.io is forbidden",
    },
  ])(
    "shows a failed $action as an error notification, and leaves no unhandled rejection",
    async ({ spec, action, reason, message }) => {
      const unhandled = vi.fn();
      process.on("unhandledRejection", unhandled);
      try {
        const error = vi.spyOn(Renderer.Component.Notifications, "error");
        serveStore(vi.fn(() => Promise.reject(reason)));

        renderItem(object(spec));
        fireEvent.click(screen.getByText(action));

        await vi.waitFor(() =>
          expect(error).toHaveBeenCalledExactlyOnceWith(
            `Failed to ${action.toLowerCase()} Kustomization fluxcd-test/podinfo: ${message}`,
          ),
        );
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(unhandled).not.toHaveBeenCalled();
      } finally {
        process.off("unhandledRejection", unhandled);
      }
    },
  );
});
