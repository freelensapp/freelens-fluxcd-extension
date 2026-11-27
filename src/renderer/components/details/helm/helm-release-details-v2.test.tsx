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

/** The text of every drawer item of the panel, nested ones included. */
const drawerItems = () => screen.getAllByTestId("drawer-item").map((item) => item.textContent);

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

  describe("Client and drift", () => {
    it("shows the Secret of the kubeConfig with its key, and the persistent client", () => {
      renderDetails(
        helmReleaseWith({
          kubeConfig: { secretRef: { name: "remote-kubeconfig", key: "value.yaml" } },
          persistentClient: false,
        }),
      );

      expect(drawerItems()).toEqual(
        expect.arrayContaining([
          "Kube Config: remote-kubeconfig",
          "Kube Config Key: value.yaml",
          "Persistent Client: False",
        ]),
      );
    });

    it("shows the default key of the kubeConfig Secret, and the ConfigMap of a kubeConfig", () => {
      renderDetails(helmReleaseWith({ kubeConfig: { secretRef: { name: "remote-kubeconfig" } } }));
      expect(drawerItems()).toContain("Kube Config Key: value");
      cleanup();

      renderDetails(helmReleaseWith({ kubeConfig: { configMapRef: { name: "remote-cluster" } } }));
      const items = drawerItems();
      expect(items).toContain("Kube Config: remote-cluster");
      expect(items.filter((item) => item?.startsWith("Kube Config Key"))).toEqual([]);
    });

    it("hides the kubeConfig and the persistent client without them", () => {
      renderDetails(helmReleaseWith({}));

      const items = drawerItems();
      expect(items.filter((item) => item?.startsWith("Kube Config"))).toEqual([]);
      expect(items.filter((item) => item?.startsWith("Persistent Client"))).toEqual([]);
    });

    it("shows each ignore rule of drift detection with its paths and target", () => {
      renderDetails(
        helmReleaseWith({
          driftDetection: {
            mode: "enabled",
            ignore: [
              { paths: ["/spec/replicas"], target: { kind: "Deployment", name: "podinfo" } },
              { paths: ["/metadata/annotations", "/metadata/labels"] },
            ],
          },
        }),
      );

      expect(drawerItems()).toContain("Drift Detection: enabled");
      expect(sectionItems("Drift Detection Ignore Rules")).toEqual([
        "Paths: /spec/replicas",
        "Target: Kind: DeploymentName: podinfo",
        "Kind: Deployment",
        "Name: podinfo",
        "Paths: /metadata/annotations, /metadata/labels",
        "Target: all objects",
      ]);
    });

    it("shows no ignore rules of drift detection without any", () => {
      renderDetails(helmReleaseWith({ driftDetection: { mode: "warn" } }));

      expect(sectionItems("Drift Detection Ignore Rules")).toBeUndefined();
    });
  });

  describe("Chart template", () => {
    const helmChartTemplate = (spec: Record<string, unknown>, metadata?: Record<string, unknown>) =>
      helmReleaseWith({
        chartRef: undefined,
        chart: {
          metadata,
          spec: { chart: "podinfo", sourceRef: { kind: "HelmRepository", name: "podinfo" }, ...spec },
        },
      });

    const ociRepositoryTemplate = (spec: Record<string, unknown>) =>
      helmReleaseWith({
        chartRef: undefined,
        chart: { kind: "OCIRepository", spec: { url: "oci://ghcr.io/stefanprodan/charts/podinfo", ...spec } },
      });

    it("shows the labels, annotations and reconcile strategy of a HelmChart template", () => {
      renderDetails(
        helmChartTemplate(
          { reconcileStrategy: "Revision" },
          { labels: { team: "a" }, annotations: { "example.com/owner": "b" } },
        ),
      );

      expect(drawerItems()).toEqual(
        expect.arrayContaining([
          "Chart Reconcile Strategy: Revision",
          "Chart Labels: team=a",
          "Chart Annotations: example.com/owner=b",
        ]),
      );
      expect(sectionItems("OCI Repository Template")).toBeUndefined();
      expect(sectionItems("Chart Verification")).toBeUndefined();
    });

    it("shows the default reconcile strategy of a HelmChart template, and no labels or annotations", () => {
      renderDetails(helmChartTemplate({}));

      const items = drawerItems();
      expect(items).toContain("Chart Reconcile Strategy: ChartVersion");
      expect(items.filter((item) => item?.startsWith("Chart Labels"))).toEqual([]);
      expect(items.filter((item) => item?.startsWith("Chart Annotations"))).toEqual([]);
    });

    it("shows no reconcile strategy without a chart template", () => {
      renderDetails(helmReleaseWith({}));

      expect(drawerItems().filter((item) => item?.startsWith("Chart Reconcile Strategy"))).toEqual([]);
    });

    it("shows only the provider and the Secret of the verification of a HelmChart template", () => {
      renderDetails(
        helmChartTemplate({
          verify: {
            provider: "notation",
            secretRef: { name: "keys" },
            trustedRootSecretRef: { name: "root" },
            matchOIDCIdentity: [{ issuer: "issuer", subject: "subject" }],
          },
        }),
      );

      expect(sectionItems("Chart Verification")).toEqual(["Provider: notation", "Trusted Public Keys: keys"]);
    });

    it("shows the fields of an OCIRepository template", () => {
      renderDetails(
        ociRepositoryTemplate({
          ref: { semver: ">=6.0.0", semverFilter: ".*-rc.*" },
          layerSelector: { mediaType: "application/vnd.cncf.helm.chart.content.v1.tar+gzip", operation: "extract" },
          provider: "aws",
          secretRef: { name: "registry" },
          serviceAccountName: "puller",
          certSecretRef: { name: "tls" },
          proxySecretRef: { name: "proxy" },
          timeout: "2m",
          ignore: "/*\n!/chart",
          insecure: true,
          suspend: true,
          verify: {
            provider: "cosign",
            secretRef: { name: "keys" },
            trustedRootSecretRef: { name: "root" },
            matchOIDCIdentity: [{ issuer: "issuer", subject: "subject" }],
          },
        }),
      );

      expect(sectionItems("OCI Repository Template")).toEqual([
        "Resumed: False",
        "Timeout: 2m",
        "Authentication Provider: aws",
        "Registry Login Credentials: registry",
        "Image Pull Service Account: puller",
        "TLS Certificate: tls",
        "Proxy Configuration: proxy",
        "Insecure Container Registry: True",
        "SemVer Filter: .*-rc.*",
        "Layer Selector: Media type: application/vnd.cncf.helm.chart.content.v1.tar+gzipOperation: extract",
        "Media type: application/vnd.cncf.helm.chart.content.v1.tar+gzip",
        "Operation: extract",
        "Source Ignore: /*\n!/chart",
      ]);
      expect(sectionItems("Chart Verification")).toEqual([
        "Provider: cosign",
        "Trusted Public Keys: keys",
        "Trusted Root: root",
        "OIDC Identity: MatchIssuer: issuerSubject: subject",
        "Issuer: issuer",
        "Subject: subject",
      ]);
      expect(drawerItems().filter((item) => item?.startsWith("Chart Reconcile Strategy"))).toEqual([]);
    });

    it("shows the defaults of an OCIRepository template, with the Helm chart layer copied", () => {
      renderDetails(ociRepositoryTemplate({}));

      expect(sectionItems("OCI Repository Template")).toEqual([
        "Resumed: True",
        "Timeout: 60s",
        "Authentication Provider: generic",
        "Layer Selector: Media type: application/vnd.cncf.helm.chart.content.v1.tar+gzipOperation: copy",
        "Media type: application/vnd.cncf.helm.chart.content.v1.tar+gzip",
        "Operation: copy",
      ]);
    });

    it("shows the operation of a layer selector without one as extract", () => {
      renderDetails(ociRepositoryTemplate({ layerSelector: { mediaType: "application/x-tar" } }));

      expect(sectionItems("OCI Repository Template")).toEqual(
        expect.arrayContaining(["Media type: application/x-tar", "Operation: extract"]),
      );
    });
  });

  describe("Status", () => {
    const statusItemNames = [
      "Current Storage Namespace",
      "Last Attempted Revision",
      "Last Attempted Revision Digest",
      "Last Attempted Release Action",
      "Last Attempted Release Action Duration",
      "Failures",
      "Install Failures",
      "Upgrade Failures",
      "Last Handled Reconcile At",
      "Last Handled Force At",
      "Last Handled Reset At",
    ];

    it("shows the fields of the status", () => {
      renderDetails(
        helmReleaseWith(
          {},
          {
            storageNamespace: "podinfo",
            failures: 3,
            installFailures: 1,
            upgradeFailures: 2,
            lastAttemptedRevision: "6.5.4+0123456789ab",
            lastAttemptedRevisionDigest: "sha256:0123456789abcdef",
            lastAttemptedReleaseAction: "upgrade",
            lastAttemptedReleaseActionDuration: "12.5s",
            lastHandledReconcileAt: "2026-11-26T10:00:00Z",
            lastHandledForceAt: "2026-11-26T11:00:00Z",
            lastHandledResetAt: "2026-11-26T12:00:00Z",
          },
        ),
      );

      expect(drawerItems()).toEqual(
        expect.arrayContaining([
          "Current Storage Namespace: podinfo",
          "Last Attempted Revision: 6.5.4+0123456789ab",
          "Last Attempted Revision Digest: sha256:0123456789abcdef",
          "Last Attempted Release Action: upgrade",
          "Last Attempted Release Action Duration: 12.5s",
          "Failures: 3",
          "Install Failures: 1",
          "Upgrade Failures: 2",
          "Last Handled Reconcile At: 2026-11-26T10:00:00Z",
          "Last Handled Force At: 2026-11-26T11:00:00Z",
          "Last Handled Reset At: 2026-11-26T12:00:00Z",
        ]),
      );
    });

    it("hides the fields of the status without them, and the counters of failures at zero", () => {
      renderDetails(helmReleaseWith({}, { failures: 0, installFailures: 0, upgradeFailures: 0 }));

      const names = drawerItems().map((item) => item?.split(": ")[0]);
      expect(names.filter((name) => statusItemNames.includes(name ?? ""))).toEqual([]);
    });
  });

  describe("History", () => {
    const snapshot = (fields: Record<string, unknown>) => ({
      digest: "sha256:aaaa",
      name: "podinfo",
      namespace: "fluxcd-test",
      status: "deployed",
      chartName: "podinfo",
      chartVersion: "6.5.4",
      appVersion: "6.5.4",
      configDigest: "sha256:bbbb",
      firstDeployed: "2026-11-25T10:00:00Z",
      lastDeployed: "2026-11-25T10:00:00Z",
      ...fields,
    });

    const historyRows = () =>
      screen.getAllByRole("row").map((row) =>
        within(row)
          .getAllByRole("cell")
          .map((cell) => cell.textContent),
      );

    it("shows the action of each snapshot, and no column of deleted or OCI digest when none has it", () => {
      renderDetails(
        helmReleaseWith(
          {},
          {
            history: [
              snapshot({ version: 2, action: "upgrade", configDigest: "sha256:2" }),
              snapshot({ version: 1, action: "install", configDigest: "sha256:1", status: "superseded" }),
            ],
          },
        ),
      );

      expect(screen.getByText("Action")).toBeTruthy();
      expect(screen.queryByText("Deleted")).toBeNull();
      expect(screen.queryByText("OCI Digest")).toBeNull();
      expect(historyRows()).toEqual([
        ["2", "2026-11-25T10:00:00Z", "6.5.4", "6.5.4", "upgrade", "deployed"],
        ["1", "2026-11-25T10:00:00Z", "6.5.4", "6.5.4", "install", "superseded"],
      ]);
      expect(sectionItems("Test Hooks")).toBeUndefined();
    });

    it("shows the columns of deleted and OCI digest when a snapshot has them", () => {
      renderDetails(
        helmReleaseWith(
          {},
          {
            history: [
              snapshot({ version: 2, action: "install", configDigest: "sha256:2", ociDigest: "sha256:cccc" }),
              snapshot({
                version: 1,
                action: "uninstall",
                configDigest: "sha256:1",
                status: "uninstalled",
                deleted: "2026-11-25T11:00:00Z",
              }),
            ],
          },
        ),
      );

      expect(screen.getByText("Deleted")).toBeTruthy();
      expect(screen.getByText("OCI Digest")).toBeTruthy();
      expect(historyRows()).toEqual([
        ["2", "2026-11-25T10:00:00Z", "6.5.4", "6.5.4", "install", "deployed", "", "sha256:cccc"],
        ["1", "2026-11-25T10:00:00Z", "6.5.4", "6.5.4", "uninstall", "uninstalled", "2026-11-25T11:00:00Z", ""],
      ]);
    });

    it("shows the test hooks of the snapshots that have them", () => {
      renderDetails(
        helmReleaseWith(
          {},
          {
            history: [
              snapshot({
                version: 2,
                configDigest: "sha256:2",
                testHooks: {
                  "podinfo-grpc-test": {
                    lastStarted: "2026-11-25T10:01:00Z",
                    lastCompleted: "2026-11-25T10:02:00Z",
                    phase: "Succeeded",
                  },
                  "podinfo-jwt-test": null,
                },
              }),
              snapshot({ version: 1, configDigest: "sha256:1", testHooks: {} }),
            ],
          },
        ),
      );

      expect(screen.getByText("podinfo-grpc-test", { exact: false })).toBeTruthy();
      expect(screen.getByText("podinfo-jwt-test", { exact: false })).toBeTruthy();
      expect(sectionItems("Test Hooks")).toEqual([
        "Release Version: 2",
        "Phase: Succeeded",
        "Last Started: 2026-11-25T10:01:00Z",
        "Last Completed: 2026-11-25T10:02:00Z",
        "Release Version: 2",
      ]);
    });
  });
});
