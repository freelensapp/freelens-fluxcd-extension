import { Renderer } from "@freelensapp/extensions";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus, NamespacedObjectKindReference } from "../types";

export interface AlertSpec extends FluxCDKubeObjectSpecWithSuspend {
  providerRef: LocalObjectReference;
  eventSeverity?: "info" | "error";
  eventSources?: NamespacedObjectKindReference[];
  eventMetadata?: Record<string, string>;
  exclusionList?: string[];
  summary?: string;
  suspend?: boolean;
}

export interface AlertStatus extends FluxCDKubeObjectStatus {}

export class Alert extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  AlertStatus,
  AlertSpec
> {
  static readonly kind = "Alert";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1beta3/alerts";

  static readonly crd = {
    apiVersions: ["notification.toolkit.fluxcd.io/v1beta3"],
    plural: "alerts",
    singular: "alert",
    shortNames: [],
    title: "Alerts",
  };
}

export class AlertApi extends Renderer.K8sApi.KubeApi<Alert> {}
export class AlertStore extends Renderer.K8sApi.KubeObjectStore<Alert> {}
