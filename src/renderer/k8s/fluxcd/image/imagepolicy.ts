import { Renderer } from "@freelensapp/extensions";
import { getApi, getStore } from "../stores";

export class ImagePolicy extends Renderer.K8sApi.KubeObject<
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

  static readonly crd = {
    apiVersions: ["image.toolkit.fluxcd.io/v1beta1", "image.toolkit.fluxcd.io/v1beta2"],
    plural: "imagepolicies",
    singular: "imagepolicy",
    shortNames: [],
    title: "Image Policies",
  };

  static getApi = getApi;
  static getStore = getStore;
}

export class ImagePolicyApi extends Renderer.K8sApi.KubeApi<ImagePolicy> {}
export class ImagePolicyStore extends Renderer.K8sApi.KubeObjectStore<ImagePolicy> {}
