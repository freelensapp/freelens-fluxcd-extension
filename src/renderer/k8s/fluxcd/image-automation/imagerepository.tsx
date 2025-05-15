import { Renderer } from "@freelensapp/extensions";

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class ImageRepository extends KubeObject<
  any,
  any,
  { image: string; provider: string; interval: string; suspend: boolean }
> {
  static readonly kind = "ImageRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/image.toolkit.fluxcd.io/v1beta1/imagerepositories";
}

export class ImageRepositoryApi extends Renderer.K8sApi.KubeApi<ImageRepository> {}
export const imageRepositoryApi = new ImageRepositoryApi({ objectConstructor: ImageRepository });
export class ImageRepositoryStore extends KubeObjectStore<ImageRepository> {
  api: Renderer.K8sApi.KubeApi<ImageRepository> = imageRepositoryApi;
}
export const imageRepositoryStore = new ImageRepositoryStore();

Renderer.K8sApi.apiManager.registerStore(imageRepositoryStore);
