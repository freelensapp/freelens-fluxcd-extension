import { Renderer } from "@freelensapp/extensions";

const { KubeApi } = Renderer.K8sApi;

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class OCIRepository extends KubeObject<any, any, { url: string }> {
  static readonly kind = "OCIRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta2/ocirepositories";
}

export class OCIRepositoryApi extends KubeApi<OCIRepository> {}
export const ociRepositoryApi = new OCIRepositoryApi({ objectConstructor: OCIRepository });
export class OCIRepositoryStore extends KubeObjectStore<OCIRepository> {
  api: Renderer.K8sApi.KubeApi<OCIRepository> = ociRepositoryApi;
}
export const ociRepositoryStore = new OCIRepositoryStore();

Renderer.K8sApi.apiManager.registerStore(ociRepositoryStore);
