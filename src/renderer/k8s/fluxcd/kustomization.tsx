import { Renderer } from "@freelensapp/extensions";
import { Condition, KubeObjectMetadata, Patch } from "../core/types";
import {
  Image,
  JSON6902Patch,
  LocalObjectReference,
  NamespacedObjectKindReference,
  NamespacedObjectReference,
  Snapshot,
} from "./types";

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export interface KustomizationSpec {
  dependsOn?: NamespacedObjectReference[];
  decryption?: {
    provider: string;
    secretRef: LocalObjectReference;
  };
  interval: string;
  retryInterval?: string;
  kubeConfig?: {
    secretRef: LocalObjectReference;
  };
  path?: string;
  postBuild?: {
    substitute?: Record<string, string>;
    substituteFrom?: {
      kind: string;
      name: string;
    }[];
  };
  prune: boolean;
  healthChecks?: NamespacedObjectKindReference[];
  patches?: Patch[];
  patchesStrategicMerge?: string[];
  patchesJson6902: JSON6902Patch[];
  images: Image[];
  serviceAccountName?: string;
  sourceRef: NamespacedObjectKindReference;
  suspend?: boolean;
  targetNamespace?: string;
  timeout?: string;
  validation?: "client" | "server" | "none";
  force?: boolean;
}

export interface KustomizationStatus {
  observedGeneration?: number;
  conditions?: Condition[];
  lastAppliedRevision?: string;
  lastAttemptedRevision?: string;
  lastHandledReconcileAt: string;
  snapshot: Snapshot;
}

export class Kustomization extends KubeObject<KubeObjectMetadata, KustomizationStatus, KustomizationSpec> {
  static readonly kind = "Kustomization";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/kustomize.toolkit.fluxcd.io/v1beta1/kustomizations";
}

export class KustomizationApi extends Renderer.K8sApi.KubeApi<Kustomization> {}
export const kustomizationApi = new KustomizationApi({ objectConstructor: Kustomization });
export class KustomizationStore extends KubeObjectStore<Kustomization> {
  api = kustomizationApi;
}
export const kustomizationStore = new KustomizationStore();
Renderer.K8sApi.apiManager.registerStore(kustomizationStore);
