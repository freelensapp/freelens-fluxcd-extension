import { Renderer } from "@freelensapp/extensions";

export class ImageUpdateAutomation extends Renderer.K8sApi.LensExtensionKubeObject<
  any,
  any,
  {
    sourceRef: {
      name: string;
      namespace: string;
      kind: string;
    };
    interval: string;
    suspend?: boolean;
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
}

export class ImageUpdateAutomationApi extends Renderer.K8sApi.KubeApi<ImageUpdateAutomation> {}
export class ImageUpdateAutomationStore extends Renderer.K8sApi.KubeObjectStore<ImageUpdateAutomation> {}
