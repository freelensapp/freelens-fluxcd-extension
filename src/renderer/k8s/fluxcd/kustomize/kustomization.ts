import { Renderer } from "@freelensapp/extensions";
import { type Condition, Patch } from "../../core/types";
import { getApi, getStore } from "../stores";
import {
  type FluxCDSpecSuspend,
  Image,
  JSON6902Patch,
  LocalObjectReference,
  NamespacedObjectKindReference,
  NamespacedObjectReference,
  Snapshot,
} from "../types";

export interface KustomizationSpec extends FluxCDSpecSuspend {
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

export class Kustomization extends Renderer.K8sApi.KubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  KustomizationStatus,
  KustomizationSpec
> {
  static readonly kind = "Kustomization";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/kustomize.toolkit.fluxcd.io/v1beta1/kustomizations";

  static readonly crd = {
    apiVersions: [
      "kustomize.toolkit.fluxcd.io/v1beta1",
      "kustomize.toolkit.fluxcd.io/v1beta2",
      "kustomize.toolkit.fluxcd.io/v1",
    ],
    plural: "kustomizations",
    singular: "kustomization",
    shortNames: ["ks"],
    title: "Kustomizations",
  };

  static getApi = getApi;
  static getStore = getStore;
}

export class KustomizationApi extends Renderer.K8sApi.KubeApi<Kustomization> {}
export class KustomizationStore extends Renderer.K8sApi.KubeObjectStore<Kustomization> {}
