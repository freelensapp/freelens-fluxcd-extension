import { Renderer } from "@freelensapp/extensions";

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class HelmRepository extends KubeObject<
  any,
  any,
  { url: string; interval: string; timeout: string; suspend: boolean }
> {
  static readonly kind = "HelmRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/helmrepositories";
}

export class HelmRepositoryApi extends Renderer.K8sApi.KubeApi<HelmRepository> {}
export const helmRepositoryApi = new HelmRepositoryApi({ objectConstructor: HelmRepository });
export class HelmRepositoryStore extends KubeObjectStore<HelmRepository> {
  api: Renderer.K8sApi.KubeApi<HelmRepository> = helmRepositoryApi;
}
export const helmRepositoryStore = new HelmRepositoryStore();

Renderer.K8sApi.apiManager.registerStore(helmRepositoryStore);
