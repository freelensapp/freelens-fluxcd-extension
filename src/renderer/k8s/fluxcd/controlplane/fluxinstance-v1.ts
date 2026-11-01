import { Renderer } from "@freelensapp/extensions";

import type { Patch } from "../../core/types";
import type { History, ResourceInventory } from "../types";

type Condition = Renderer.K8sApi.Condition;

export type DistributionVariant =
  | "upstream-alpine"
  | "enterprise-alpine"
  | "enterprise-distroless"
  | "enterprise-distroless-fips";

export interface Distribution {
  version: string;
  registry: string;
  variant?: DistributionVariant;
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

export type ClusterType = "kubernetes" | "openshift" | "aws" | "azure" | "gcp";

export type ClusterSize = "small" | "medium" | "large";

export interface Cluster {
  domain?: string;
  multitenant?: boolean;
  /** Legacy: use `multitenantObjectIdentity` instead. */
  multitenantWorkloadIdentity?: boolean;
  multitenantObjectIdentity?: boolean;
  tenantDefaultServiceAccount?: string;
  tenantDefaultDecryptionServiceAccount?: string;
  tenantDefaultKubeConfigServiceAccount?: string;
  /** Legacy: use `objectIdentityRBAC` instead. */
  objectLevelWorkloadIdentity?: boolean;
  objectIdentityRBAC?: boolean;
  networkPolicy?: boolean;
  type?: ClusterType;
  size?: ClusterSize;
}

export interface WorkloadAPI {
  endpoint: string;
  csiDriver?: string;
}

export interface BrokerAPI {
  endpoint: string;
  ids: string[];
}

export interface MTLS {
  enabled: boolean;
  componentIDTemplate: string;
  receivers?: string[];
  extraArtifactClients?: string[];
  extraArtifactServers?: string[];
  extraNotifiers?: string[];
}

export interface SPIFFE {
  workloadAPI: WorkloadAPI;
  brokerAPI?: BrokerAPI;
  mtls?: MTLS;
}

export type ShardingStorage = "ephemeral" | "persistent";

export interface Sharding {
  key?: string;
  shards: string[];
  storage?: ShardingStorage;
}

export interface Storage {
  class: string;
  size: string;
}

export interface Kustomize {
  patches?: Patch[];
}

export type SyncKind = "OCIRepository" | "GitRepository" | "Bucket";

export type SyncProvider = "generic" | "aws" | "azure" | "gcp" | "github";

export interface Sync {
  name?: string;
  interval?: string;
  kind: SyncKind;
  url: string;
  ref: string;
  path: string;
  pullSecret?: string;
  provider?: SyncProvider;
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
  spiffe?: SPIFFE;
  sharding?: Sharding;
  storage?: Storage;
  kustomize?: Kustomize;
  wait?: boolean;
  migrateResources?: boolean;
  sync?: Sync;
}

export interface MTLSStatus {
  enabled: boolean;
  componentIDTemplate?: string;
  extraArtifactServers?: string[];
}

export interface SPIFFEStatus {
  mtls?: MTLSStatus;
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
  spiffe?: SPIFFEStatus;
  history?: History;
}

export class FluxInstance extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  FluxInstanceStatus,
  FluxInstanceSpec
> {
  declare kind: "FluxInstance";
  declare apiVersion: "fluxcd.controlplane.io/v1";

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
