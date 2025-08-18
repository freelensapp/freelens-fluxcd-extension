import { Renderer } from "@freelensapp/extensions";

import type { Condition, LocalObjectReference } from "@freelensapp/kube-object";

import type { Selector } from "../core/types";

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

export interface Artifact {
  path: string;
  url: string;
  revision: string;
  checksum: string;
  lastUpdateTime?: string;
  size?: number;
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
