// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Kustomization } from "../../../k8s/fluxcd/kustomize/kustomization-v1";
import { KustomizationDetails } from "./kustomization-details-v1";

// What the host rejects with for an object that does not exist: a
// `JsonApiErrorParsed` with the `Status` of the API server.
const notFound = (name: string) => ({
  error: { kind: "Status", apiVersion: "v1", code: 404, reason: "NotFound", message: `configmaps "${name}" not found` },
  isUsedForNotification: false,
});

const unhandledRejections: unknown[] = [];
const onUnhandledRejection = (reason: unknown) => unhandledRejections.push(reason);

beforeEach(() => {
  unhandledRejections.length = 0;
  process.on("unhandledRejection", onUnhandledRejection);
  vi.spyOn(Kustomization, "getStore").mockReturnValue({ getByName: () => undefined } as never);
});

afterEach(() => {
  process.off("unhandledRejection", onUnhandledRejection);
  cleanup();
  vi.restoreAllMocks();
});

type DetailsProps = Parameters<typeof KustomizationDetails>[0];

const kustomization = (substituteFrom: { kind: string; name: string; optional?: boolean }[]) =>
  new Kustomization({
    apiVersion: "kustomize.toolkit.fluxcd.io/v1",
    kind: "Kustomization",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: {
      interval: "10m",
      prune: true,
      sourceRef: { kind: "GitRepository", name: "podinfo" },
      postBuild: { substituteFrom },
    },
  } as unknown as ConstructorParameters<typeof Kustomization>[0]);

const renderDetails = (object: Kustomization) =>
  render(<KustomizationDetails {...({ object } as unknown as DetailsProps)} />);

describe("KustomizationDetails", () => {
  it("skips a source of variables that does not exist and shows the next one", async () => {
    const get = vi
      .spyOn(Renderer.K8sApi.configMapApi, "get")
      .mockImplementation(async ({ name }) =>
        name === "missing" ? Promise.reject(notFound(name)) : ({ data: { cluster_env: "prod" } } as never),
      );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderDetails(
      kustomization([
        { kind: "ConfigMap", name: "missing", optional: true },
        { kind: "ConfigMap", name: "vars" },
      ]),
    );

    expect((await screen.findByText(/cluster_env/)).textContent).toBe("cluster_env: prod");
    expect(get.mock.calls.map(([descriptor]) => descriptor)).toEqual([
      { name: "missing", namespace: "fluxcd-test" },
      { name: "vars", namespace: "fluxcd-test" },
    ]);
    expect(warn).not.toHaveBeenCalled();
    expect(unhandledRejections).toEqual([]);
  });

  it("warns of a source that cannot be read for another reason and goes on", async () => {
    vi.spyOn(Renderer.K8sApi.configMapApi, "get").mockImplementation(async ({ name }) =>
      name === "forbidden"
        ? Promise.reject({ error: { kind: "Status", code: 403, reason: "Forbidden" } })
        : ({ data: { cluster_env: "prod" } } as never),
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderDetails(
      kustomization([
        { kind: "ConfigMap", name: "forbidden" },
        { kind: "ConfigMap", name: "vars" },
      ]),
    );

    expect((await screen.findByText(/cluster_env/)).textContent).toBe("cluster_env: prod");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("fluxcd-test/forbidden");
    expect(unhandledRejections).toEqual([]);
  });
});
