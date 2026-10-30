import { Renderer } from "@freelensapp/extensions";

import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export type ProviderSpecType =
  | "slack"
  | "discord"
  | "msteams"
  | "rocket"
  | "generic"
  | "generic-hmac"
  | "github"
  | "gitlab"
  | "gitea"
  | "giteapullrequestcomment"
  | "bitbucketserver"
  | "bitbucket"
  | "azuredevops"
  | "googlechat"
  | "googlepubsub"
  | "webex"
  | "sentry"
  | "azureeventhub"
  | "telegram"
  | "lark"
  | "matrix"
  | "opsgenie"
  | "alertmanager"
  | "grafana"
  | "githubdispatch"
  | "githubpullrequestcomment"
  | "gitlabmergerequestcomment"
  | "pagerduty"
  | "datadog"
  | "nats"
  | "zulip"
  | "otel"
  | "zoom"
  | "incident.io"
  | "mastodon";

export interface ProviderSpec extends FluxCDKubeObjectSpecWithSuspend {
  type: ProviderSpecType;
  channel?: string;
  username?: string;
  address?: string;
  timeout?: string;
  proxySecretRef?: LocalObjectReference;
  secretRef?: LocalObjectReference;
  serviceAccountName?: string;
  certSecretRef?: LocalObjectReference;
  suspend?: boolean;
  commitStatusExpr?: string;
}

// The API has no status. An object stored by an earlier version can still have one.
export interface ProviderStatus extends FluxCDKubeObjectStatus {}

export class Provider extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ProviderStatus,
  ProviderSpec
> {
  declare kind: "Provider";
  declare apiVersion: "notification.toolkit.fluxcd.io/v1";

  static readonly kind = "Provider";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/notification.toolkit.fluxcd.io/v1/providers";

  static readonly crd = {
    apiVersions: ["notification.toolkit.fluxcd.io/v1"],
    plural: "providers",
    singular: "provider",
    shortNames: [],
    title: "Providers",
  };
}

export class ProviderApi extends Renderer.K8sApi.KubeApi<Provider> {}
export class ProviderStore extends Renderer.K8sApi.KubeObjectStore<Provider> {}
