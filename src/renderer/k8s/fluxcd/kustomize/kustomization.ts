import { Renderer } from "@freelensapp/extensions";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { Patch } from "../../core/types";
import type {
  FluxCDKubeObjectCRD,
  FluxCDKubeObjectSpecWithSuspend,
  FluxCDKubeObjectStatus,
  Image,
  JSON6902Patch,
  NamespacedObjectKindReference,
  NamespacedObjectReference,
  Snapshot,
} from "../types";

export interface KustomizationSpec extends FluxCDKubeObjectSpecWithSuspend {
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

export interface KustomizationStatus extends FluxCDKubeObjectStatus {
  lastAppliedRevision?: string;
  lastAttemptedRevision?: string;
  snapshot: Snapshot;
}

export class Kustomization extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  KustomizationStatus,
  KustomizationSpec
> {
  static readonly kind = "Kustomization";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/kustomize.toolkit.fluxcd.io/v1beta1/kustomizations";

  static readonly crd: FluxCDKubeObjectCRD = {
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
}

export class KustomizationApi extends Renderer.K8sApi.KubeApi<Kustomization> {}
export class KustomizationStore extends Renderer.K8sApi.KubeObjectStore<Kustomization> {}
