import { Renderer } from "@freelensapp/extensions";

import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";
import type { AlertSpecEventSeverity, CrossNamespaceObjectReference } from "./alert-v1";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export interface AlertSpec extends FluxCDKubeObjectSpecWithSuspend {
  providerRef: LocalObjectReference;
  eventSeverity?: AlertSpecEventSeverity;
  eventSources: CrossNamespaceObjectReference[];
  inclusionList?: string[];
  eventMetadata?: Record<string, string>;
  exclusionList?: string[];
  /** Deprecated: use `eventMetadata` instead. */
  summary?: string;
  suspend?: boolean;
}

// The API has no status. An object stored by an earlier version can still have one.
export interface AlertStatus extends FluxCDKubeObjectStatus {}

export class Alert extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  AlertStatus,
  AlertSpec
> {
  declare kind: "Alert";
  declare apiVersion: "notification.toolkit.fluxcd.io/v1beta3";

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
