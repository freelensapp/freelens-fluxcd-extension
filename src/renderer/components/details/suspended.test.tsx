// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FluxInstance } from "../../k8s/fluxcd/controlplane/fluxinstance-v1";
import { FluxReport } from "../../k8s/fluxcd/controlplane/fluxreport-v1";
import { ResourceSet } from "../../k8s/fluxcd/controlplane/resourceset-v1";
import { ResourceSetInputProvider } from "../../k8s/fluxcd/controlplane/resourcesetinputprovider-v1";
import { fluxOperatorReconcileAnnotation } from "../../k8s/fluxcd/controlplane/types";
import { HelmRelease as HelmRelease_v2 } from "../../k8s/fluxcd/helm/helmrelease-v2";
import { HelmRelease as HelmRelease_v2beta1 } from "../../k8s/fluxcd/helm/helmrelease-v2beta1";
import { HelmRelease as HelmRelease_v2beta2 } from "../../k8s/fluxcd/helm/helmrelease-v2beta2";
import { ImagePolicy as ImagePolicy_v1 } from "../../k8s/fluxcd/image/imagepolicy-v1";
import { ImagePolicy as ImagePolicy_v1beta2 } from "../../k8s/fluxcd/image/imagepolicy-v1beta2";
import { ImageRepository as ImageRepository_v1 } from "../../k8s/fluxcd/image/imagerepository-v1";
import { ImageRepository as ImageRepository_v1beta2 } from "../../k8s/fluxcd/image/imagerepository-v1beta2";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1 } from "../../k8s/fluxcd/image/imageupdateautomation-v1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1beta1 } from "../../k8s/fluxcd/image/imageupdateautomation-v1beta1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1beta2 } from "../../k8s/fluxcd/image/imageupdateautomation-v1beta2";
import { Kustomization } from "../../k8s/fluxcd/kustomize/kustomization-v1";
import { Alert as Alert_v1 } from "../../k8s/fluxcd/notification/alert-v1";
import { Alert as Alert_v1beta2 } from "../../k8s/fluxcd/notification/alert-v1beta2";
import { Alert as Alert_v1beta3 } from "../../k8s/fluxcd/notification/alert-v1beta3";
import { Provider as Provider_v1 } from "../../k8s/fluxcd/notification/provider-v1";
import { Provider as Provider_v1beta2 } from "../../k8s/fluxcd/notification/provider-v1beta2";
import { Provider as Provider_v1beta3 } from "../../k8s/fluxcd/notification/provider-v1beta3";
import { Receiver } from "../../k8s/fluxcd/notification/receiver-v1";
import { ArtifactGenerator, sourceWatcherReconcileAnnotation } from "../../k8s/fluxcd/source/artifactgenerator-v1beta1";
import { Bucket as Bucket_v1 } from "../../k8s/fluxcd/source/bucket-v1";
import { Bucket as Bucket_v1beta2 } from "../../k8s/fluxcd/source/bucket-v1beta2";
import { GitRepository } from "../../k8s/fluxcd/source/gitrepository-v1";
import { HelmChart as HelmChart_v1 } from "../../k8s/fluxcd/source/helmchart-v1";
import { HelmChart as HelmChart_v1beta2 } from "../../k8s/fluxcd/source/helmchart-v1beta2";
import { HelmRepository as HelmRepository_v1 } from "../../k8s/fluxcd/source/helmrepository-v1";
import { HelmRepository as HelmRepository_v1beta2 } from "../../k8s/fluxcd/source/helmrepository-v1beta2";
import { OCIRepository as OCIRepository_v1 } from "../../k8s/fluxcd/source/ocirepository-v1";
import { OCIRepository as OCIRepository_v1beta2 } from "../../k8s/fluxcd/source/ocirepository-v1beta2";
import { FluxInstanceDetails } from "./controlplane/flux-instance-details-v1";
import { FluxReportDetails } from "./controlplane/flux-report-details-v1";
import { ResourceSetDetails } from "./controlplane/resource-set-details";
import { ResourceSetInputProviderDetails } from "./controlplane/resource-set-input-provider-details-v1";
import { HelmReleaseDetails as HelmReleaseDetails_v2 } from "./helm/helm-release-details-v2";
import { HelmReleaseDetails as HelmReleaseDetails_v2beta1 } from "./helm/helm-release-details-v2beta1";
import { HelmReleaseDetails as HelmReleaseDetails_v2beta2 } from "./helm/helm-release-details-v2beta2";
import { ImagePolicyDetails as ImagePolicyDetails_v1 } from "./image/image-policy-details-v1";
import { ImagePolicyDetails as ImagePolicyDetails_v1beta2 } from "./image/image-policy-details-v1beta2";
import { ImageRepositoryDetails as ImageRepositoryDetails_v1 } from "./image/image-repository-details-v1";
import { ImageRepositoryDetails as ImageRepositoryDetails_v1beta2 } from "./image/image-repository-details-v1beta2";
import { ImageUpdateAutomationDetails as ImageUpdateAutomationDetails_v1 } from "./image/image-update-automation-details-v1";
import { ImageUpdateAutomationDetails as ImageUpdateAutomationDetails_v1beta1 } from "./image/image-update-automation-details-v1beta1";
import { ImageUpdateAutomationDetails as ImageUpdateAutomationDetails_v1beta2 } from "./image/image-update-automation-details-v1beta2";
import { KustomizationDetails } from "./kustomize/kustomization-details-v1";
import { AlertDetails as AlertDetails_v1 } from "./notification/alert-details-v1";
import { AlertDetails as AlertDetails_v1beta2 } from "./notification/alert-details-v1beta2";
import { AlertDetails as AlertDetails_v1beta3 } from "./notification/alert-details-v1beta3";
import { ProviderDetails as ProviderDetails_v1 } from "./notification/provider-details-v1";
import { ProviderDetails as ProviderDetails_v1beta2 } from "./notification/provider-details-v1beta2";
import { ProviderDetails as ProviderDetails_v1beta3 } from "./notification/provider-details-v1beta3";
import { ReceiverDetails } from "./notification/receiver-details-v1";
import { ArtifactGeneratorDetails } from "./source/artifact-generator-details-v1beta1";
import { BucketDetails as BucketDetails_v1 } from "./source/bucket-details-v1";
import { BucketDetails as BucketDetails_v1beta2 } from "./source/bucket-details-v1beta2";
import { GitRepositoryDetails } from "./source/git-repository-details-v1";
import { HelmChartDetails as HelmChartDetails_v1 } from "./source/helm-chart-details-v1";
import { HelmChartDetails as HelmChartDetails_v1beta2 } from "./source/helm-chart-details-v1beta2";
import { HelmRepositoryDetails as HelmRepositoryDetails_v1 } from "./source/helm-repository-details-v1";
import { HelmRepositoryDetails as HelmRepositoryDetails_v1beta2 } from "./source/helm-repository-details-v1beta2";
import { OCIRepositoryDetails as OCIRepositoryDetails_v1 } from "./source/oci-repository-details-v1";
import { OCIRepositoryDetails as OCIRepositoryDetails_v1beta2 } from "./source/oci-repository-details-v1beta2";

import type React from "react";

type KubeObjectClass = typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;

// The details panels of the kinds with `spec.suspend` and of those that an annotation suspends, each with the fields
// of the spec that it reads besides `suspend`.
const sourceRef = { kind: "GitRepository", name: "podinfo" };
const helmChartTemplate = { spec: { chart: "podinfo", sourceRef: { kind: "HelmRepository", name: "podinfo" } } };

const specSuspendPanels: [KubeObjectClass, React.ComponentType<any>, Record<string, unknown>][] = [
  [Bucket_v1, BucketDetails_v1, { bucketName: "podinfo", endpoint: "s3.amazonaws.com", interval: "1m" }],
  [Bucket_v1beta2, BucketDetails_v1beta2, { bucketName: "podinfo", endpoint: "s3.amazonaws.com", interval: "1m" }],
  [GitRepository, GitRepositoryDetails, { url: "https://example.com/podinfo", interval: "1m" }],
  [HelmChart_v1, HelmChartDetails_v1, { chart: "podinfo", sourceRef, interval: "1m" }],
  [HelmChart_v1beta2, HelmChartDetails_v1beta2, { chart: "podinfo", sourceRef, interval: "1m" }],
  [HelmRepository_v1, HelmRepositoryDetails_v1, { url: "https://example.com/podinfo", interval: "1m" }],
  [HelmRepository_v1beta2, HelmRepositoryDetails_v1beta2, { url: "https://example.com/podinfo", interval: "1m" }],
  [OCIRepository_v1, OCIRepositoryDetails_v1, { url: "oci://example.com/podinfo", interval: "1m" }],
  [OCIRepository_v1beta2, OCIRepositoryDetails_v1beta2, { url: "oci://example.com/podinfo", interval: "1m" }],
  [Kustomization, KustomizationDetails, { sourceRef, interval: "1m", prune: true }],
  [HelmRelease_v2, HelmReleaseDetails_v2, { chart: helmChartTemplate, interval: "1m" }],
  [HelmRelease_v2beta1, HelmReleaseDetails_v2beta1, { chart: helmChartTemplate, interval: "1m" }],
  [HelmRelease_v2beta2, HelmReleaseDetails_v2beta2, { chart: helmChartTemplate, interval: "1m" }],
  [ImagePolicy_v1, ImagePolicyDetails_v1, { imageRepositoryRef: { name: "podinfo" }, policy: {} }],
  [ImagePolicy_v1beta2, ImagePolicyDetails_v1beta2, { imageRepositoryRef: { name: "podinfo" }, policy: {} }],
  [ImageRepository_v1, ImageRepositoryDetails_v1, { image: "example.com/podinfo", interval: "1m" }],
  [ImageRepository_v1beta2, ImageRepositoryDetails_v1beta2, { image: "example.com/podinfo", interval: "1m" }],
  [ImageUpdateAutomation_v1, ImageUpdateAutomationDetails_v1, { sourceRef, interval: "1m" }],
  [ImageUpdateAutomation_v1beta1, ImageUpdateAutomationDetails_v1beta1, { sourceRef, interval: "1m" }],
  [ImageUpdateAutomation_v1beta2, ImageUpdateAutomationDetails_v1beta2, { sourceRef, interval: "1m" }],
  [Alert_v1, AlertDetails_v1, { providerRef: { name: "slack" }, eventSources: [] }],
  [Alert_v1beta2, AlertDetails_v1beta2, { providerRef: { name: "slack" }, eventSources: [] }],
  [Alert_v1beta3, AlertDetails_v1beta3, { providerRef: { name: "slack" }, eventSources: [] }],
  [Provider_v1, ProviderDetails_v1, { type: "slack" }],
  [Provider_v1beta2, ProviderDetails_v1beta2, { type: "slack" }],
  [Provider_v1beta3, ProviderDetails_v1beta3, { type: "slack" }],
  [Receiver, ReceiverDetails, { type: "github", resources: [], secretRef: { name: "token" } }],
];

const annotationSuspendPanels: [KubeObjectClass, React.ComponentType<any>, Record<string, unknown>, string][] = [
  [
    FluxInstance,
    FluxInstanceDetails,
    { distribution: { version: "2.x", registry: "ghcr.io/fluxcd" } },
    fluxOperatorReconcileAnnotation,
  ],
  [
    FluxReport,
    FluxReportDetails,
    { distribution: { entitlement: "Unknown", status: "Installed" } },
    fluxOperatorReconcileAnnotation,
  ],
  [ResourceSet, ResourceSetDetails, {}, fluxOperatorReconcileAnnotation],
  [ResourceSetInputProvider, ResourceSetInputProviderDetails, { type: "Static" }, fluxOperatorReconcileAnnotation],
  [ArtifactGenerator, ArtifactGeneratorDetails, { sources: [], artifacts: [] }, sourceWatcherReconcileAnnotation],
];

beforeEach(() => {
  for (const [kubeObjectClass] of [...specSuspendPanels, ...annotationSuspendPanels]) {
    vi.spyOn(kubeObjectClass, "getStore").mockReturnValue({ getByName: () => undefined, items: [] } as never);
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const renderDetails = (
  kubeObjectClass: KubeObjectClass,
  Details: React.ComponentType<any>,
  spec: Record<string, unknown>,
  annotations?: Record<string, string>,
) => {
  const object = new kubeObjectClass({
    apiVersion: kubeObjectClass.crd?.apiVersions[0],
    kind: kubeObjectClass.kind,
    metadata: { name: "podinfo", namespace: "fluxcd-test", annotations },
    spec,
  } as never);
  render(<Details object={object} />);
};

const suspendedItems = () =>
  screen
    .queryAllByTestId("drawer-item")
    .map((item) => item.textContent)
    .filter((item) => item?.startsWith("Suspended: "));

const titled = <T extends [KubeObjectClass, ...unknown[]]>(panels: T[]) =>
  panels.map((panel) => ({ title: `${panel[0].kind} ${panel[0].crd?.apiVersions[0]}`, panel }));

describe.each(titled(specSuspendPanels))("the details of $title", ({ panel: [kubeObjectClass, Details, spec] }) => {
  it("shows a suspended object as Suspended: True", () => {
    renderDetails(kubeObjectClass, Details, { ...spec, suspend: true });

    expect(suspendedItems()).toEqual(["Suspended: True"]);
  });

  it.each([false, undefined])("shows an object with suspend %s as Suspended: False", (suspend) => {
    renderDetails(kubeObjectClass, Details, suspend === undefined ? spec : { ...spec, suspend });

    expect(suspendedItems()).toEqual(["Suspended: False"]);
  });
});

describe.each(titled(annotationSuspendPanels))(
  "the details of $title",
  ({ panel: [kubeObjectClass, Details, spec, annotation] }) => {
    it.each(["disabled", "Disabled"])(
      "shows an object whose reconcile annotation is %s as Suspended: True",
      (value) => {
        renderDetails(kubeObjectClass, Details, spec, { [annotation]: value });

        expect(suspendedItems()).toEqual(["Suspended: True"]);
      },
    );

    it.each([undefined, "enabled"])("shows an object whose reconcile annotation is %s as Suspended: False", (value) => {
      renderDetails(kubeObjectClass, Details, spec, value === undefined ? undefined : { [annotation]: value });

      expect(suspendedItems()).toEqual(["Suspended: False"]);
    });
  },
);
