import { Renderer } from "@freelensapp/extensions";

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class HelmRelease extends KubeObject<
  any,
  any,
  {
    chart: {
      spec: {
        version: string;
        sourceRef: {
          kind: string;
          name: string;
          namespace: string;
        };
        interval: string;
        chart: string;
      };
    };
    interval: string;
  }
> {
  static readonly kind = "HelmRelease";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/helm.toolkit.fluxcd.io/v2beta1/helmreleases";
}

export class HelmReleaseApi extends Renderer.K8sApi.KubeApi<HelmRelease> {}
export const helmReleaseApi = new HelmReleaseApi({ objectConstructor: HelmRelease });
export class HelmReleaseStore extends KubeObjectStore<HelmRelease> {
  api: Renderer.K8sApi.KubeApi<HelmRelease> = helmReleaseApi;
}
export const helmReleaseStore = new HelmReleaseStore();

Renderer.K8sApi.apiManager.registerStore(helmReleaseStore);
