import { Renderer } from "@freelensapp/extensions";

import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export type CrossNamespaceObjectReferenceKind =
  | "Bucket"
  | "GitRepository"
  | "Kustomization"
  | "HelmRelease"
  | "HelmChart"
  | "HelmRepository"
  | "ImageRepository"
  | "ImagePolicy"
  | "ImageUpdateAutomation"
  | "OCIRepository"
  | "ArtifactGenerator"
  | "ExternalArtifact";

export interface CrossNamespaceObjectReference {
  apiVersion?: string;
  kind: CrossNamespaceObjectReferenceKind;
  name: string;
  namespace?: string;
  matchLabels?: Record<string, string>;
}

export type AlertSpecEventSeverity = "info" | "error";

export interface AlertSpec extends FluxCDKubeObjectSpecWithSuspend {
  providerRef: LocalObjectReference;
  eventSeverity?: AlertSpecEventSeverity;
  eventSources: CrossNamespaceObjectReference[];
  inclusionList?: string[];
  eventMetadata?: Record<string, string>;
  exclusionList?: string[];
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
  declare apiVersion: "notification.toolkit.fluxcd.io/v1";

  static readonly kind = "Alert";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1/alerts";

  static readonly crd = {
    apiVersions: ["notification.toolkit.fluxcd.io/v1"],
    plural: "alerts",
    singular: "alert",
    shortNames: [],
    title: "Alerts",
  };
}

export class AlertApi extends Renderer.K8sApi.KubeApi<Alert> {}
export class AlertStore extends Renderer.K8sApi.KubeObjectStore<Alert> {}
