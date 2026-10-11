import { Renderer } from "@freelensapp/extensions";

import type { Selector } from "../core/types";

type Condition = Renderer.K8sApi.Condition;
type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export interface NamespacedObjectReference extends LocalObjectReference {
  namespace?: string;
}

export interface NamespacedObjectKindReference extends NamespacedObjectReference {
  apiVersion?: string;
  kind: string;
}

export interface NamespaceSelector {
  matchLabels?: Record<string, string>;
}

export interface AccessFrom {
  namespaceSelectors: NamespaceSelector[];
}

/**
 * `meta.Artifact` of fluxcd/pkg (`apis/meta/artifact.go`), the artifact of the `v1` sources and of an
 * ExternalArtifact, and the `Artifact` of source-controller `v1beta2` and `v1beta1`, which this type covers too:
 * `checksum` is set by those versions only, replaced by `digest` in `v1`, and `lastUpdateTime` is optional there.
 */
export interface Artifact {
  path: string;
  url: string;
  revision: string;
  digest?: string;
  checksum?: string;
  lastUpdateTime?: string;
  size?: number;
  metadata?: Record<string, string>;
}

export interface KubeConfigReference {
  configMapRef?: LocalObjectReference;
  secretRef?: SecretKeyReference;
}

export interface Image {
  name: string;
  newName?: string;
  newTag?: string;
  digest?: string;
}

export interface JSON6902Patch {
  patch: {
    op: "add" | "remove" | "replace" | "move" | "copy" | "test";
    path: string;
    from?: string;
    value?: any;
  }[];
  target: Selector;
}

export interface SecretKeyReference {
  name: string;
  key?: string;
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

export interface ResourceInventory {
  entries: ResourceRef[];
}

export interface ResourceRef {
  id: string;
  v: string;
}

export interface Snapshot {
  checksum: string;
  entries: {
    namespace: string;
    kinds: Record<string, string>;
  }[];
}

export interface FluxCDKubeObjectCRD extends Renderer.K8sApi.LensExtensionKubeObjectCRD {
  title: string;
}

export interface FluxCDKubeObjectSpecWithSuspend {
  suspend?: boolean;
}

export interface FluxCDKubeObjectStatus {
  observedGeneration?: number;
  lastHandledReconcileAt?: string;
  conditions?: Condition[];
}
