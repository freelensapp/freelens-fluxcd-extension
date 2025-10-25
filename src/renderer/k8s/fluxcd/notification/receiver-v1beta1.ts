import { Renderer } from "@freelensapp/extensions";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus, NamespacedObjectKindReference } from "../types";

export interface ReceiverSpec extends FluxCDKubeObjectSpecWithSuspend {
  type:
    | "generic"
    | "generic-hmac"
    | "github"
    | "gitlab"
    | "bitbucket"
    | "harbor"
    | "dockerhub"
    | "quay"
    | "gcr"
    | "nexus"
    | "acr";
  events: string[];
  resources: NamespacedObjectKindReference[];
  secretRef?: LocalObjectReference;
  suspend?: boolean;
}

export interface ReceiverStatus extends FluxCDKubeObjectStatus {
  url?: string;
}

export class Receiver extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ReceiverStatus,
  ReceiverSpec
> {
  static readonly kind = "Receiver";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1beta1/receivers";

  static readonly crd = {
    apiVersions: ["notification.toolkit.fluxcd.io/v1beta1"],
    plural: "receivers",
    singular: "receiver",
    shortNames: [],
    title: "Receivers",
  };
}

export class ReceiverApi extends Renderer.K8sApi.KubeApi<Receiver> {}
export class ReceiverStore extends Renderer.K8sApi.KubeObjectStore<Receiver> {}
