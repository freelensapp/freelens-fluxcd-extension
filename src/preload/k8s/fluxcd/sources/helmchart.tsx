import { Renderer } from "@freelensapp/extensions";

const { KubeApi } = Renderer.K8sApi;

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class HelmChart extends KubeObject<
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
}

export class HelmChartApi extends KubeApi<HelmChart> {}
export const helmChartApi = new HelmChartApi({ objectConstructor: HelmChart });
export class HelmChartStore extends KubeObjectStore<HelmChart> {
  api: Renderer.K8sApi.KubeApi<HelmChart> = helmChartApi;
}
export const helmChartStore = new HelmChartStore();

Renderer.K8sApi.apiManager.registerStore(helmChartStore);
