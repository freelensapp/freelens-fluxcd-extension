import { Renderer } from "@freelensapp/extensions";

const { KubeApi } = Renderer.K8sApi;

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class ImageUpdateAutomation extends KubeObject<
  any,
  any,
  {
    sourceRef: {
      name: string;
      namespace: string;
      kind: string;
    };
    interval: string;
  }
> {
  static readonly kind = "ImageUpdateAutomation";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/image.toolkit.fluxcd.io/v1beta1/imageupdateautomations";
}

export class ImageUpdateAutomationApi extends KubeApi<ImageUpdateAutomation> {}
export const imageUpdateAutomationApi = new ImageUpdateAutomationApi({ objectConstructor: ImageUpdateAutomation });
export class ImageUpdateAutomationStore extends KubeObjectStore<ImageUpdateAutomation> {
  api: Renderer.K8sApi.KubeApi<ImageUpdateAutomation> = imageUpdateAutomationApi;
}
export const imageUpdateAutomationStore = new ImageUpdateAutomationStore();

Renderer.K8sApi.apiManager.registerStore(imageUpdateAutomationStore);
