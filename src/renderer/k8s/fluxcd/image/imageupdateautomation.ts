import { Renderer } from "@freelensapp/extensions";
import { getApi, getStore } from "../stores";

export class ImageUpdateAutomation extends Renderer.K8sApi.KubeObject<
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

  static readonly crd = {
    apiVersions: ["image.toolkit.fluxcd.io/v1beta1", "image.toolkit.fluxcd.io/v1beta2"],
    plural: "imageupdateautomations",
    singular: "imageupdateautomation",
    shortNames: [],
    title: "Image Update Automations",
  };

  static getApi = getApi;
  static getStore = getStore;
}

export class ImageUpdateAutomationApi extends Renderer.K8sApi.KubeApi<ImageUpdateAutomation> {}
export class ImageUpdateAutomationStore extends Renderer.K8sApi.KubeObjectStore<ImageUpdateAutomation> {}
