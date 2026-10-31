import { Renderer } from "@freelensapp/extensions";

import type { Artifact, FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";
import type { OIDCIdentityMatch } from "./ocirepository-v1";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export type LocalHelmChartSourceReferenceKind = "HelmRepository" | "GitRepository" | "Bucket";

export interface LocalHelmChartSourceReference {
  apiVersion?: string;
  kind: LocalHelmChartSourceReferenceKind;
  name: string;
}

export type HelmChartVerificationProvider = "cosign" | "notation";

export interface HelmChartVerification {
  provider: HelmChartVerificationProvider;
  secretRef?: LocalObjectReference;
  matchOIDCIdentity?: OIDCIdentityMatch[];
}

export type HelmChartSpecReconcileStrategy = "ChartVersion" | "Revision";

export interface HelmChartSpec extends FluxCDKubeObjectSpecWithSuspend {
  chart: string;
  version?: string;
  sourceRef: LocalHelmChartSourceReference;
  interval: string;
  reconcileStrategy?: HelmChartSpecReconcileStrategy;
  valuesFiles?: string[];
  ignoreMissingValuesFiles?: boolean;
  suspend?: boolean;
  verify?: HelmChartVerification;
}

export interface HelmChartStatus extends FluxCDKubeObjectStatus {
  observedSourceArtifactRevision?: string;
  observedChartName?: string;
  observedValuesFiles?: string[];
  url?: string;
  artifact?: Artifact;
}

export class HelmChart extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  HelmChartStatus,
  HelmChartSpec
> {
  declare kind: "HelmChart";
  declare apiVersion: "source.toolkit.fluxcd.io/v1";

  static readonly kind = "HelmChart";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1/helmcharts";

  static readonly crd = {
    apiVersions: ["source.toolkit.fluxcd.io/v1"],
    plural: "helmcharts",
    singular: "helmchart",
    shortNames: ["hc"],
    title: "Helm Charts",
  };
}

export class HelmChartApi extends Renderer.K8sApi.KubeApi<HelmChart> {}
export class HelmChartStore extends Renderer.K8sApi.KubeObjectStore<HelmChart> {}
