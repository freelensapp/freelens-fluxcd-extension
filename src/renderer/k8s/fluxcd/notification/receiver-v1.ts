import { Renderer } from "@freelensapp/extensions";

import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";
import type { CrossNamespaceObjectReference } from "./alert-v1";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export type ReceiverSpecType =
  | "generic"
  | "generic-hmac"
  | "generic-oidc"
  | "github"
  | "gitlab"
  | "bitbucket"
  | "harbor"
  | "dockerhub"
  | "quay"
  | "gcr"
  | "nexus"
  | "acr"
  | "cdevents";

export interface ReceiverResource extends CrossNamespaceObjectReference {
  filter?: string;
}

export interface OIDCVariable {
  name: string;
  expression: string;
}

export interface OIDCValidation {
  expression: string;
  message: string;
}

export interface OIDCProvider {
  issuerURL: string;
  audience?: string;
  variables?: OIDCVariable[];
  validations: OIDCValidation[];
}

export interface ReceiverSpec extends FluxCDKubeObjectSpecWithSuspend {
  type: ReceiverSpecType;
  interval?: string;
  events?: string[];
  resources: ReceiverResource[];
  resourceFilter?: string;
  secretRef?: LocalObjectReference;
  oidcProviders?: OIDCProvider[];
  suspend?: boolean;
}

export interface ReceiverStatus extends FluxCDKubeObjectStatus {
  webhookPath?: string;
}

export class Receiver extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ReceiverStatus,
  ReceiverSpec
> {
  declare kind: "Receiver";
  declare apiVersion: "notification.toolkit.fluxcd.io/v1";

  static readonly kind = "Receiver";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1/receivers";

  static readonly crd = {
    apiVersions: ["notification.toolkit.fluxcd.io/v1"],
    plural: "receivers",
    singular: "receiver",
    shortNames: [],
    title: "Receivers",
  };
}

export class ReceiverApi extends Renderer.K8sApi.KubeApi<Receiver> {}
export class ReceiverStore extends Renderer.K8sApi.KubeObjectStore<Receiver> {}
