import { Renderer } from "@freelensapp/extensions";

export class HelmChart extends Renderer.K8sApi.LensExtensionKubeObject<
  any,
  any,
  {
    chart: string;
    suspend: boolean;
    version: string;
    reconcileStrategy: string;
    interval: string;
    timeout: string;
    values: string;
    sourceRef: { kind: string; name: string; namespace: string };
  }
> {
  static readonly kind = "HelmChart";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/helmcharts";

  static readonly crd = {
    apiVersions: [
      "source.toolkit.fluxcd.io/v1beta1",
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
