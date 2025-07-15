import { Renderer } from "@freelensapp/extensions";

export class Receiver extends Renderer.K8sApi.LensExtensionKubeObject<
  any,
  any,
  {
    type: string;
    interval: string;
    suspend: boolean;
    slack: { channel: string };
    events: string[];
    resources: [
      {
        kind: string;
        name: string;
        namespace: string;
      },
    ];
  }
> {
  static readonly kind = "Receiver";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1beta1/receivers";

  static readonly crd = {
    apiVersions: ["notification.toolkit.fluxcd.io/v1beta1", "notification.toolkit.fluxcd.io/v1beta2"],
    plural: "receivers",
    singular: "receiver",
    shortNames: [],
    title: "Receiver",
  };
}

export class ReceiverApi extends Renderer.K8sApi.KubeApi<Receiver> {}
export class ReceiverStore extends Renderer.K8sApi.KubeObjectStore<Receiver> {}
