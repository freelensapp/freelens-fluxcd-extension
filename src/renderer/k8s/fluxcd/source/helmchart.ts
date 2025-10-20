import { Renderer } from "@freelensapp/extensions";

import type { AccessFrom, Artifact, FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

export interface LocalHelmChartSourceReference {
  apiVersion?: string;
  kind: "HelmRepository" | "HelmChart" | "Bucket";
  name: string;
}

export interface HelmChartSpec extends FluxCDKubeObjectSpecWithSuspend {
  chart: string;
  version?: string;
  sourceRef: LocalHelmChartSourceReference;
  interval: string;
  reconcileStrategy?: "ChartVersion" | "Revision";
  valuesFiles?: string[];
  valuesFile?: string;
  suspend?: boolean;
  accessFrom?: AccessFrom;
}

export interface HelmChartStatus extends FluxCDKubeObjectStatus {
  url?: string;
  artifact?: Artifact;
}

export class HelmChart extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  HelmChartStatus,
  HelmChartSpec
> {
  static readonly kind = "HelmChart";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1/helmrepositories";

  static readonly crd = {
    apiVersions: [
      "source.toolkit.fluxcd.io/v1beta2",
      "source.toolkit.fluxcd.io/v1",
    ],
    plural: "helmcharts",
    singular: "helmchart",
    shortNames: ["hc"],
    title: "Helm Charts",
  };
}

export class HelmChartApi extends Renderer.K8sApi.KubeApi<HelmChart> {}
export class HelmChartStore extends Renderer.K8sApi.KubeObjectStore<HelmChart> {}
