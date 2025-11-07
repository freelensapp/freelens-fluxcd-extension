import { Renderer } from "@freelensapp/extensions";

import type { Condition, LabelSelector } from "@freelensapp/kube-object";

export interface CommonMetadata {
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
}

export interface InputProviderReference {
  apiVersion?: string;
  kind: string;
  name?: string;
  selector?: LabelSelector;
}

export interface Dependency {
  apiVersion: string;
  kind: string;
  name: string;
  namespace?: string;
  ready?: boolean;
  readyExpr?: string;
}

type ResourceSetInput = Record<string, any>;

export interface ResourceRef {
  id: string;
  v: string;
}

export interface ResourceInventory {
  entries: ResourceRef[];
}

export interface Snapshot {
  digest: string;
  firstReconciled: string;
  lastReconciled: string;
  lastReconciledDuration: string;
  lastReconciledStatus: string;
  totalReconciliations: number;
  metadata?: Record<string, string>;
}

export type History = Snapshot[];

export interface ResourceSetSpec {
  commonMetadata?: CommonMetadata;
  inputs?: ResourceSetInput[];
  inputsFrom?: InputProviderReference[];
  resources?: any[];
  resourcesTemplate?: string;
  dependsOn?: Dependency[];
  serviceAccountName?: string;
  wait?: boolean;
}

export interface ResourceSetStatus {
  lastHandledReconcileAt?: string;
  conditions?: Condition[];
  inventory?: ResourceInventory;
  lastAppliedRevision?: string;
  history?: History;
}

export class ResourceSet extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ResourceSetStatus,
  ResourceSetSpec
> {
  static readonly kind = "ResourceSet";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/fluxcd.controlplane.io/v1/resourcesets";

  static readonly crd = {
    apiVersions: ["fluxcd.controlplane.io/v1"],
    plural: "resourcesets",
    singular: "resourceset",
    shortNames: ["rset"],
    title: "Resource Sets",
  };
}

export class ResourceSetApi extends Renderer.K8sApi.KubeApi<ResourceSet> {}
export class ResourceSetStore extends Renderer.K8sApi.KubeObjectStore<ResourceSet> {}
