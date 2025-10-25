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
  ResourceInventory,
  Snapshot,
} from "../types";

export interface Decryption {
  provider: string;
  secretRef: LocalObjectReference;
}

export interface KubeConfig {
  secretRef: LocalObjectReference;
}

export interface SubstituteReference {
  kind: string;
  name: string;
}

export interface PostBuild {
  substitute?: Record<string, string>;
  substituteFrom?: SubstituteReference[];
}

export interface KustomizationSpec extends FluxCDKubeObjectSpecWithSuspend {
  dependsOn?: NamespacedObjectReference[];
  decryption?: Decryption;
  interval: string;
  retryInterval?: string;
  kubeConfig?: KubeConfig;
  path?: string;
  postBuild?: PostBuild;
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
  inventory?: ResourceInventory;
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
    apiVersions: ["kustomize.toolkit.fluxcd.io/v1beta1"],
    plural: "kustomizations",
    singular: "kustomization",
    shortNames: ["ks"],
    title: "Kustomizations",
  };

  static getLastAppliedRevision(object: Kustomization): string | undefined {
    return object.status?.lastAppliedRevision?.replace(/^refs\/(heads|tags)\//, "");
  }

  static getSourceRefText(object: Kustomization): string {
    return [
      object.spec.sourceRef.kind,
      ": ",
      object.spec.sourceRef.namespace ? `${object.spec.sourceRef.namespace}/` : "",
      object.spec.sourceRef.name,
    ].join("");
  }

  static getSourceRefUrl(object: Kustomization): string | undefined {
    const ref = object.spec.sourceRef;
    if (!ref) return;
    return Renderer.K8sApi.apiManager.lookupApiLink(ref, object);
  }
}

export class KustomizationApi extends Renderer.K8sApi.KubeApi<Kustomization> {}
export class KustomizationStore extends Renderer.K8sApi.KubeObjectStore<Kustomization> {}
