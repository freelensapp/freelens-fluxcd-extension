import { Renderer } from "@freelensapp/extensions";

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class Alert extends KubeObject<
  any,
  any,
  {
    eventSources: [
      {
        kind: string;
        name: string;
        namespace: string;
        filters: [{ name: string; values: string[] }];
      },
    ];
    suspend: boolean;
    eventSeverity: string;
    providerRef: { name: string; namespace: string };
  }
> {
  static readonly kind = "Alert";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1beta2/alerts";
}

export class AlertApi extends Renderer.K8sApi.KubeApi<Alert> {}
export const alertApi = new AlertApi({ objectConstructor: Alert });
export class AlertStore extends KubeObjectStore<Alert> {
  api: Renderer.K8sApi.KubeApi<Alert> = alertApi;
}
export const alertStore = new AlertStore();

Renderer.K8sApi.apiManager.registerStore(alertStore);
