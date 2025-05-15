import { Renderer } from "@freelensapp/extensions";

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class Provider extends KubeObject<
  any,
  any,
  { suspend: boolean; type: string; secretRef: { name: string; namespace: string } }
> {
  static readonly kind = "Provider";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1beta1/providers";
}

export class ProviderApi extends Renderer.K8sApi.KubeApi<Provider> {}
export const providerApi = new ProviderApi({ objectConstructor: Provider });
export class ProviderStore extends KubeObjectStore<Provider> {
  api: Renderer.K8sApi.KubeApi<Provider> = providerApi;
}
export const providerStore = new ProviderStore();

Renderer.K8sApi.apiManager.registerStore(providerStore);
