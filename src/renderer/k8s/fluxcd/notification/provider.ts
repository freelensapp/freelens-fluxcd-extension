import { Renderer } from "@freelensapp/extensions";

export class Provider extends Renderer.K8sApi.LensExtensionKubeObject<
  any,
  any,
  { suspend: boolean; type: string; secretRef: { name: string; namespace: string } }
> {
  static readonly kind = "Provider";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1beta1/providers";

  static readonly crd = {
    apiVersions: ["notification.toolkit.fluxcd.io/v1beta1", "notification.toolkit.fluxcd.io/v1beta2"],
    plural: "providers",
    singular: "provider",
    shortNames: [],
    title: "Provider",
  };
}

export class ProviderApi extends Renderer.K8sApi.KubeApi<Provider> {}
export class ProviderStore extends Renderer.K8sApi.KubeObjectStore<Provider> {}
