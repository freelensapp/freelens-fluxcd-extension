import { Renderer } from "@freelensapp/extensions";

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class ImagePolicy extends KubeObject<
  any,
  any,
  {
    imageRepositoryRef: {
      name: string;
      namespace: string;
    };
  }
> {
  static readonly kind = "ImagePolicy";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/image.toolkit.fluxcd.io/v1beta1/imagepolicies";
}

export class ImagePolicyApi extends Renderer.K8sApi.KubeApi<ImagePolicy> {}
export const imagePolicyApi = new ImagePolicyApi({ objectConstructor: ImagePolicy });
export class ImagePolicyStore extends KubeObjectStore<ImagePolicy> {
  api: Renderer.K8sApi.KubeApi<ImagePolicy> = imagePolicyApi;
}
export const imagePolicyStore = new ImagePolicyStore();

Renderer.K8sApi.apiManager.registerStore(imagePolicyStore);
