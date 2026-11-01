// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HelmRelease } from "../../../k8s/fluxcd/helm/helmrelease-v2";
import { HelmReleaseDetails } from "./helm-release-details-v2";

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
  vi.spyOn(HelmRelease, "getStore").mockReturnValue({ getByName: () => undefined } as never);
});

afterEach(() => {
  process.off("unhandledRejection", onUnhandledRejection);
  cleanup();
  vi.restoreAllMocks();
});

type DetailsProps = Parameters<typeof HelmReleaseDetails>[0];

const helmRelease = (valuesFrom: { kind: string; name: string; optional?: boolean }[]) =>
  new HelmRelease({
    apiVersion: "helm.toolkit.fluxcd.io/v2",
    kind: "HelmRelease",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: {
      interval: "10m",
      chartRef: { kind: "OCIRepository", name: "podinfo" },
      valuesFrom,
    },
  } as unknown as ConstructorParameters<typeof HelmRelease>[0]);

const renderDetails = (object: HelmRelease) =>
  render(<HelmReleaseDetails {...({ object } as unknown as DetailsProps)} />);

describe("HelmReleaseDetails", () => {
  it("skips a source of values that does not exist and shows the next one", async () => {
    const get = vi
      .spyOn(Renderer.K8sApi.configMapApi, "get")
      .mockImplementation(async ({ name }) =>
        name === "missing"
          ? Promise.reject(notFound(name))
          : ({ data: { "values.yaml": "replicaCount: 2\n" } } as never),
      );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderDetails(
      helmRelease([
        { kind: "ConfigMap", name: "missing", optional: true },
        { kind: "ConfigMap", name: "values" },
      ]),
    );

    expect((await screen.findByText(/replicaCount/)).textContent).toBe("replicaCount: 2\n");
    expect(get.mock.calls.map(([descriptor]) => descriptor)).toEqual([
      { name: "missing", namespace: "fluxcd-test" },
      { name: "values", namespace: "fluxcd-test" },
    ]);
    expect(warn).not.toHaveBeenCalled();
    expect(unhandledRejections).toEqual([]);
  });

  it("warns of a source that cannot be read for another reason and goes on", async () => {
    vi.spyOn(Renderer.K8sApi.configMapApi, "get").mockImplementation(async ({ name }) =>
      name === "forbidden"
        ? Promise.reject({ error: { kind: "Status", code: 403, reason: "Forbidden" } })
        : ({ data: { "values.yaml": "replicaCount: 2\n" } } as never),
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderDetails(
      helmRelease([
        { kind: "ConfigMap", name: "forbidden" },
        { kind: "ConfigMap", name: "values" },
      ]),
    );

    expect((await screen.findByText(/replicaCount/)).textContent).toBe("replicaCount: 2\n");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("fluxcd-test/forbidden");
    expect(unhandledRejections).toEqual([]);
  });

  it("shows the badge of an optional source of values", async () => {
    vi.spyOn(Renderer.K8sApi.configMapApi, "get").mockResolvedValue({
      data: { "values.yaml": "replicaCount: 2\n" },
    } as never);

    renderDetails(helmRelease([{ kind: "ConfigMap", name: "values", optional: true }]));

    await screen.findByText(/replicaCount/);
    expect(screen.getAllByTestId("drawer-item").map((item) => item.textContent)).toContain("Optional: True");
  });

  it("shows the chart version of a dependency, and no revision, which v2 does not have", () => {
    const dependency = new HelmRelease({
      apiVersion: "helm.toolkit.fluxcd.io/v2",
      kind: "HelmRelease",
      metadata: { name: "redis", namespace: "fluxcd-test" },
      spec: { interval: "10m", chartRef: { kind: "OCIRepository", name: "redis" } },
      // A v2beta1 field that a v2 object does not have; the panel must not read it.
      status: { lastAppliedRevision: "18.0.0", history: [{ chartVersion: "19.6.4" }] },
    } as unknown as ConstructorParameters<typeof HelmRelease>[0]);
    const getByName = vi.fn((name: string, namespace: string) =>
      name === "redis" && namespace === "fluxcd-test" ? dependency : undefined,
    );
    vi.spyOn(HelmRelease, "getStore").mockReturnValue({ getByName } as never);
    const object = helmRelease([]);
    object.spec.dependsOn = [{ name: "redis" }];

    renderDetails(object);

    const items = screen.getAllByTestId("drawer-item").map((item) => item.textContent);
    expect(items).toContain("Chart Version: 19.6.4");
    expect(items.filter((item) => item?.includes("18.0.0"))).toEqual([]);
    expect(getByName).toHaveBeenCalledWith("redis", "fluxcd-test");
  });
});
