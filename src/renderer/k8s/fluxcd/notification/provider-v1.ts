import { Renderer } from "@freelensapp/extensions";

import type { FluxCDKubeObjectSpecWithSuspend } from "../types";

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

// The API has no status, and the API server returns none: the CRD has no `status` in the schema of this version,
// and the API server prunes what the schema of the requested version lacks, also from an object stored with a status
// by an earlier version.
export class Provider extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  void,
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
