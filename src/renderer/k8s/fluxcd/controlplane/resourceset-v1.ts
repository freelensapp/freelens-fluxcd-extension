import { Renderer } from "@freelensapp/extensions";

import type { History } from "../types";

type Condition = Renderer.K8sApi.Condition;
type LabelSelector = Renderer.K8sApi.LabelSelector;

export interface CommonMetadata {
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
}

export type InputStrategySpecName = "Flatten" | "Permute";

export interface InputStrategySpec {
  name: InputStrategySpecName;
  includeEmptyProviders?: boolean;
}

export interface ResourceSetStep {
  name: string;
  resources?: any[];
  resourcesTemplate?: string;
  timeout?: string;
}

export type InputProviderReferenceAPIVersion = "fluxcd.controlplane.io/v1";

export type InputProviderReferenceKind = "ResourceSetInputProvider";

export interface InputProviderReference {
  apiVersion?: InputProviderReferenceAPIVersion;
  kind?: InputProviderReferenceKind;
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

export interface ResourceSetSpec {
  commonMetadata?: CommonMetadata;
  inputStrategy?: InputStrategySpec;
  inputs?: ResourceSetInput[];
  inputsFrom?: InputProviderReference[];
  resources?: any[];
  resourcesTemplate?: string;
  steps?: ResourceSetStep[];
  dependsOn?: Dependency[];
  serviceAccountName?: string;
  wait?: boolean;
}

export interface ResourceSetStatus {
  lastHandledReconcileAt?: string;
  conditions?: Condition[];
  inventory?: ResourceInventory;
  lastAppliedRevision?: string;
  externalChecksumRefs?: string[];
  history?: History;
}

export class ResourceSet extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ResourceSetStatus,
  ResourceSetSpec
> {
  declare kind: "ResourceSet";
  declare apiVersion: "fluxcd.controlplane.io/v1";

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
