import { Renderer } from "@freelensapp/extensions";

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class Receiver extends KubeObject<
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
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1beta2/receivers";
}

export class ReceiverApi extends Renderer.K8sApi.KubeApi<Receiver> {}
export const receiverApi = new ReceiverApi({ objectConstructor: Receiver });
export class ReceiverStore extends KubeObjectStore<Receiver> {
  api: Renderer.K8sApi.KubeApi<Receiver> = receiverApi;
}
export const receiverStore = new ReceiverStore();

Renderer.K8sApi.apiManager.registerStore(receiverStore);
