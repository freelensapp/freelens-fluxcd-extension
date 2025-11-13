import { Renderer } from "@freelensapp/extensions";

import type { Condition } from "@freelensapp/kube-object";

import type { Patch } from "../../core/types";
import type { History, ResourceInventory } from "../types";

export interface Distribution {
  version: string;
  registry: string;
  imagePullSecret?: string;
  artifact?: string;
  artifactPullSecret?: string;
}

export type Component =
  | "source-controller"
  | "kustomize-controller"
  | "helm-controller"
  | "notification-controller"
  | "image-reflector-controller"
  | "image-automation-controller"
  | "source-watcher";

export interface CommonMetadata {
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export interface Cluster {
  domain?: string;
  multitenant: boolean;
  multitenantWorkloadIdentity?: boolean;
  tenantDefaultServiceAccount?: string;
  tenantDefaultDecryptionServiceAccount?: string;
  tenantDefaultKubeConfigServiceAccount?: string;
  objectLevelWorkloadIdentity?: string;
  networkPolicy: boolean;
  type?: "kubernetes" | "openshift" | "aws" | "azure" | "gcp";
  size?: "small" | "medium" | "large";
}

export interface Sharding {
  key?: string;
  shards: string[];
  storage?: "ephemeral" | "persistent";
}

export interface Storage {
  class: string;
  size: string;
}

export interface Kustomize {
  patches: Patch[];
}

export interface Sync {
  name?: string;
  interval?: string;
  kind: "OCIRepository" | "GitRepository" | "Bucket";
  url: string;
  ref: string;
  path: string;
  pullSecret?: string;
  provider?: "generic" | "aws" | "azure" | "gcp" | "github";
}

export interface ComponentImage {
  name: string;
  repository: string;
  tag: string;
  digest?: string;
}

export interface FluxInstanceSpec {
  distribution: Distribution;
  components?: Component[];
  commonMetadata?: CommonMetadata;
  cluster?: Cluster;
  sharding?: Sharding;
  storage?: Storage;
  kustomize: Kustomize;
  wait?: boolean;
  migrateResources?: boolean;
  sync?: Sync;
}

export interface FluxInstanceStatus {
  // ReconcileRequestStatus:
  lastHandledReconcileAt?: string;
  // ForceRequestStatus:
  lastHandledForceAt?: string;
  // FluxInstanceStatus:
  conditions?: Condition[];
  lastAttemptedRevision?: string;
  lastAppliedRevision?: string;
  lastArtifactRevision?: string;
  components?: ComponentImage[];
  inventory?: ResourceInventory;
  history?: History;
}

export class FluxInstance extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  FluxInstanceStatus,
  FluxInstanceSpec
> {
  static readonly kind = "FluxInstance";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/fluxcd.controlplane.io/v1/fluxinstances";

  static readonly crd = {
    apiVersions: ["fluxcd.controlplane.io/v1"],
    plural: "fluxinstances",
    singular: "fluxinstance",
    shortNames: [],
    title: "Flux Instances",
  };
}

export class FluxInstanceApi extends Renderer.K8sApi.KubeApi<FluxInstance> {}
export class FluxInstanceStore extends Renderer.K8sApi.KubeObjectStore<FluxInstance> {}
