import { Renderer } from "@freelensapp/extensions";

export class ImagePolicy extends Renderer.K8sApi.LensExtensionKubeObject<
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
}

export class ImagePolicyApi extends Renderer.K8sApi.KubeApi<ImagePolicy> {}
export class ImagePolicyStore extends Renderer.K8sApi.KubeObjectStore<ImagePolicy> {}
