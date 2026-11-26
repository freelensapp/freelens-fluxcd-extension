import { Renderer } from "@freelensapp/extensions";

import type { FluxCDKubeObjectSpecWithSuspend } from "../types";
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

// The API has no status, and the API server returns none: the CRD has no `status` in the schema of this version,
// and the API server prunes what the schema of the requested version lacks, also from an object stored with a status
// by an earlier version.
export class Alert extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  void,
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
