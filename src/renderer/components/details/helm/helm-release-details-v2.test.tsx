// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen, within } from "@testing-library/react";
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

const helmRelease = (valuesFrom: { kind: string; name: string; valuesKey?: string; optional?: boolean }[]) =>
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

/** A HelmRelease with the fields of `spec` and `status` added to the minimal one. */
const helmReleaseWith = (spec: Record<string, unknown>, status?: Record<string, unknown>) =>
  new HelmRelease({
    apiVersion: "helm.toolkit.fluxcd.io/v2",
    kind: "HelmRelease",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { interval: "10m", chartRef: { kind: "OCIRepository", name: "podinfo" }, ...spec },
    status,
  } as unknown as ConstructorParameters<typeof HelmRelease>[0]);

/** The text of the drawer items of a section, by its title, or `undefined` without the section. */
const sectionItems = (title: string) => {
  const section = screen.queryAllByText(title, { exact: true }).at(0)?.parentElement;
  if (!section) return;
  return within(section)
    .queryAllByTestId("drawer-item")
    .map((item) => item.textContent);
};

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

  it("shows the values of a ConfigMap and a Secret of the same name, and of two keys of one source", async () => {
    vi.spyOn(Renderer.K8sApi.configMapApi, "get").mockResolvedValue({
      data: { "values.yaml": "from: configmap\n", "other.yaml": "from: other key\n" },
    } as never);
    vi.spyOn(Renderer.K8sApi.secretsApi, "get").mockResolvedValue({
      data: { "values.yaml": btoa("from: secret\n") },
    } as never);
    const error = vi.spyOn(console, "error");

    const { container } = renderDetails(
      helmRelease([
        { kind: "ConfigMap", name: "values" },
        { kind: "Secret", name: "values" },
        { kind: "ConfigMap", name: "values", valuesKey: "other.yaml" },
      ]),
    );

    await screen.findByText(/from: secret/);
    const values = [...container.querySelectorAll("pre")]
      .map((pre) => pre.textContent)
      .filter((text) => text?.startsWith("from:"));
    expect(values).toEqual(["from: configmap\n", "from: secret\n", "from: other key\n"]);
    expect(error).not.toHaveBeenCalled();
  });

  describe("Install, Upgrade and Rollback", () => {
    it("shows no section of an action that the spec does not set", () => {
      renderDetails(helmReleaseWith({}));

      expect(sectionItems("Install")).toBeUndefined();
      expect(sectionItems("Upgrade")).toBeUndefined();
      expect(sectionItems("Rollback")).toBeUndefined();
    });

    it("shows the set fields of install, with the fixed strategy of its remediation", () => {
      renderDetails(
        helmReleaseWith({
          install: {
            timeout: "10m",
            strategy: { name: "RetryOnFailure", retryInterval: "2m" },
            remediation: { retries: 3, ignoreTestFailures: true },
            disableTakeOwnership: true,
            disableWait: true,
            disableWaitForJobs: true,
            disableHooks: true,
            disableOpenAPIValidation: true,
            disableSchemaValidation: true,
            replace: true,
            skipCRDs: true,
            crds: "CreateReplace",
            createNamespace: true,
            serverSideApply: false,
          },
        }),
      );

      const items = sectionItems("Install");
      expect(items).toEqual(
        expect.arrayContaining([
          "Timeout: 10m",
          "Strategy: RetryOnFailure (retry interval: 2m)",
          "Retries: 3",
          "Ignore Test Failures: True",
          "Remediate Last Failure: False",
          "Strategy: uninstall",
          "CRDs: CreateReplace",
          "Skip CRDs: True",
          "Server-Side Apply: False",
          "Create Namespace: True",
          "Replace: True",
          "Disable Take Ownership: True",
          "Disable Wait: True",
          "Disable Wait For Jobs: True",
          "Disable Hooks: True",
          "Disable OpenAPI Validation: True",
          "Disable Schema Validation: True",
        ]),
      );
    });

    it("shows only the set fields of an action, and no remediation without one", () => {
      renderDetails(helmReleaseWith({ install: { createNamespace: true }, upgrade: { force: true }, rollback: {} }));

      expect(sectionItems("Install")).toEqual(["Create Namespace: True"]);
      expect(sectionItems("Upgrade")).toEqual(["Force: True"]);
      expect(sectionItems("Rollback")).toEqual([]);
    });

    it("shows the set fields of upgrade, and the defaults of its remediation", () => {
      renderDetails(
        helmReleaseWith({
          upgrade: {
            timeout: "15m",
            strategy: { name: "RemediateOnFailure" },
            remediation: { retries: 2 },
            disableTakeOwnership: true,
            disableWait: true,
            disableWaitForJobs: true,
            disableHooks: true,
            disableOpenAPIValidation: true,
            disableSchemaValidation: true,
            force: true,
            preserveValues: true,
            cleanupOnFail: true,
            crds: "Create",
            serverSideApply: "auto",
            chartNameChangeStrategy: "InPlaceUpdate",
          },
        }),
      );

      const items = sectionItems("Upgrade");
      expect(items).toEqual(
        expect.arrayContaining([
          "Timeout: 15m",
          "Strategy: RemediateOnFailure",
          // Remediate Last Failure is true by default when retries is above 0, and the strategy is rollback.
          "Remediation: Retries: 2Remediate Last Failure: TrueStrategy: rollback",
          "Retries: 2",
          "Remediate Last Failure: True",
          "Strategy: rollback",
          "CRDs: Create",
          "Server-Side Apply: auto",
          "Chart Name Change Strategy: InPlaceUpdate",
          "Force: True",
          "Preserve Values: True",
          "Cleanup On Fail: True",
          "Disable Take Ownership: True",
          "Disable Wait: True",
          "Disable Wait For Jobs: True",
          "Disable Hooks: True",
          "Disable OpenAPI Validation: True",
          "Disable Schema Validation: True",
        ]),
      );
    });

    it("shows the remediation of upgrade as set, and unlimited retries", () => {
      renderDetails(
        helmReleaseWith({
          upgrade: { remediation: { retries: -1, remediateLastFailure: false, strategy: "uninstall" } },
        }),
      );

      expect(sectionItems("Upgrade")).toEqual([
        "Remediation: Retries: -1 (unlimited)Remediate Last Failure: FalseStrategy: uninstall",
        "Retries: -1 (unlimited)",
        "Remediate Last Failure: False",
        "Strategy: uninstall",
      ]);
    });

    it("shows the remediation of install without retries as 0", () => {
      renderDetails(helmReleaseWith({ install: { remediation: {} } }));

      expect(sectionItems("Install")).toEqual([
        "Remediation: Retries: 0Remediate Last Failure: FalseStrategy: uninstall",
        "Retries: 0",
        "Remediate Last Failure: False",
        "Strategy: uninstall",
      ]);
    });

    it("shows the set fields of rollback", () => {
      renderDetails(
        helmReleaseWith({
          rollback: {
            timeout: "5m",
            disableWait: true,
            disableWaitForJobs: true,
            disableHooks: true,
            recreate: true,
            force: true,
            cleanupOnFail: true,
            serverSideApply: "disabled",
          },
        }),
      );

      expect(sectionItems("Rollback")).toEqual([
        "Timeout: 5m",
        "Server-Side Apply: disabled",
        "Force: True",
        "Recreate: True",
        "Cleanup On Fail: True",
        "Disable Wait: True",
        "Disable Wait For Jobs: True",
        "Disable Hooks: True",
      ]);
    });
  });

  describe("Test and Uninstall", () => {
    it("shows no section of test or uninstall that the spec does not set", () => {
      renderDetails(helmReleaseWith({}));

      expect(sectionItems("Test")).toBeUndefined();
      expect(sectionItems("Uninstall")).toBeUndefined();
    });

    it("shows the fields of test, with each filter", () => {
      renderDetails(
        helmReleaseWith({
          test: {
            enable: true,
            timeout: "3m",
            ignoreFailures: true,
            filters: [{ name: "smoke" }, { name: "slow", exclude: true }],
          },
        }),
      );

      expect(sectionItems("Test")).toEqual([
        "Enabled: True",
        "Timeout: 3m",
        "Ignore Failures: True",
        "Filters: smoke: runslow: exclude",
        "smoke: run",
        "slow: exclude",
      ]);
    });

    it("shows test as disabled by default, and no filters without any", () => {
      renderDetails(helmReleaseWith({ test: { filters: [] } }));

      expect(sectionItems("Test")).toEqual(["Enabled: False"]);
    });

    it("shows the set fields of uninstall", () => {
      renderDetails(
        helmReleaseWith({
          uninstall: {
            timeout: "2m",
            disableHooks: true,
            keepHistory: true,
            disableWait: true,
            deletionPropagation: "foreground",
          },
        }),
      );

      expect(sectionItems("Uninstall")).toEqual([
        "Timeout: 2m",
        "Deletion Propagation: foreground",
        "Keep History: True",
        "Disable Wait: True",
        "Disable Hooks: True",
      ]);
    });

    it("shows the default deletion propagation of uninstall", () => {
      renderDetails(helmReleaseWith({ uninstall: {} }));

      expect(sectionItems("Uninstall")).toEqual(["Deletion Propagation: background"]);
    });
  });
});
