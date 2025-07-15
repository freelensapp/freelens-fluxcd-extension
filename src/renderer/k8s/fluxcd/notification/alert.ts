import { Renderer } from "@freelensapp/extensions";

export class Alert extends Renderer.K8sApi.LensExtensionKubeObject<
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
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1beta1/alerts";

  static readonly crd = {
    apiVersions: ["notification.toolkit.fluxcd.io/v1beta1", "notification.toolkit.fluxcd.io/v1beta2"],
    plural: "alerts",
    singular: "alert",
    shortNames: [],
    title: "Alerts",
  };
}

export class AlertApi extends Renderer.K8sApi.KubeApi<Alert> {}
export class AlertStore extends Renderer.K8sApi.KubeObjectStore<Alert> {}
