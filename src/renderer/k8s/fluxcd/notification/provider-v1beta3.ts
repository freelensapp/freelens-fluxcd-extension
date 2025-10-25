import { Renderer } from "@freelensapp/extensions";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

export interface ProviderSpec extends FluxCDKubeObjectSpecWithSuspend {
  type?:
    | "slack"
    | "discord"
    | "msteams"
    | "rocket"
    | "generic"
    | "generic-hmac"
    | "github"
    | "gitlab"
    | "bitbucket"
    | "azuredevops"
    | "googlechat"
    | "webex"
    | "sentry"
    | "azureeventhub"
    | "telegram"
    | "lark"
    | "matrix"
    | "opsgenie"
    | "alertmanager"
    | "grafana"
    | "githubdispatch";
  channel?: string;
  username?: string;
  address?: string;
  timeout?: string;
  proxy?: string;
  secretRef?: LocalObjectReference;
  certSecretRef?: LocalObjectReference;
  suspend?: boolean;
}

export interface ProviderStatus extends FluxCDKubeObjectStatus {}

export class Provider extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ProviderStatus,
  ProviderSpec
> {
  static readonly kind = "Provider";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1beta3/providers";

  static readonly crd = {
    apiVersions: ["notification.toolkit.fluxcd.io/v1beta3"],
    plural: "providers",
    singular: "provider",
    shortNames: [],
    title: "Providers",
  };
}

export class ProviderApi extends Renderer.K8sApi.KubeApi<Provider> {}
export class ProviderStore extends Renderer.K8sApi.KubeObjectStore<Provider> {}
