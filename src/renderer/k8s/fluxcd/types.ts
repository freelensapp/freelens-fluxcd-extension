import { Renderer } from "@freelensapp/extensions";
import { type Condition, Selector } from "../core/types";

export interface LocalObjectReference {
  name: string;
}

export interface NamespacedObjectReference {
  name: string;
  namespace?: string;
}

export interface NamespacedObjectKindReference {
  apiVersion?: string;
  kind: string;
  name: string;
  namespace?: string;
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

export interface Snapshot {
  checksum: string;
  entries: {
    namespace: string;
    kinds: Record<string, string>;
  }[];
}

export interface FluxCDObjectCRD {
  apiVersions: string[];
  plural: string;
  singular: string;
  shortNames: string[];
  title: string;
}

export interface FluxCDObjectStatic {
  readonly crd: FluxCDObjectCRD;
  getApi(): Renderer.K8sApi.KubeApi | undefined;
  getStore(): Renderer.K8sApi.KubeObjectStore | undefined;
}

export type FluxCDObject = typeof Renderer.K8sApi.KubeObject<any, any, any> & FluxCDObjectStatic;

export interface FluxCDStatusConditions {
  observedGeneration?: number;
  conditions?: Condition[];
  lastAppliedRevision?: string;
  lastAttemptedRevision?: string;
  lastHandledReconcileAt: string;
  snapshot: Snapshot;
}

export interface FluxCDSpecSuspend {
  suspend?: boolean;
}
