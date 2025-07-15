import { Renderer } from "@freelensapp/extensions";

export class ImageRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  any,
  any,
  { image: string; provider: string; interval: string; suspend: boolean }
> {
  static readonly kind = "ImageRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/image.toolkit.fluxcd.io/v1beta1/imagerepositories";

  static readonly crd = {
    apiVersions: ["image.toolkit.fluxcd.io/v1beta1", "image.toolkit.fluxcd.io/v1beta2"],
    plural: "imagerepositories",
    singular: "imagerepository",
    shortNames: [],
    title: "Image Repositories",
  };
}

export class ImageRepositoryApi extends Renderer.K8sApi.KubeApi<ImageRepository> {}
export class ImageRepositoryStore extends Renderer.K8sApi.KubeObjectStore<ImageRepository> {}
