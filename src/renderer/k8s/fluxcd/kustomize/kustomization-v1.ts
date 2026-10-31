import { Renderer } from "@freelensapp/extensions";
import { getRefUrl } from "../utils";

import type { Patch, Selector } from "../../core/types";
import type {
  CustomHealthCheck,
  DependencyReference,
  FluxCDKubeObjectCRD,
  FluxCDKubeObjectSpecWithSuspend,
  FluxCDKubeObjectStatus,
  History,
  Image,
  KubeConfigReference,
  NamespacedObjectKindReference,
  ResourceInventory,
} from "../types";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export type DecryptionProvider = "sops";

export interface Decryption {
  provider: DecryptionProvider;
  serviceAccountName?: string;
  secretRef?: LocalObjectReference;
}

export type SubstituteReferenceKind = "Secret" | "ConfigMap";

export interface SubstituteReference {
  kind: SubstituteReferenceKind;
  name: string;
  optional?: boolean;
}

export type SubstituteStrategy = "WithVariables" | "Always";

export interface PostBuild {
  substituteStrategy?: SubstituteStrategy;
  substitute?: Record<string, string>;
  substituteFrom?: SubstituteReference[];
}

export type CrossNamespaceSourceReferenceKind = "OCIRepository" | "GitRepository" | "Bucket" | "ExternalArtifact";

export interface CrossNamespaceSourceReference {
  apiVersion?: string;
  kind: CrossNamespaceSourceReferenceKind;
  name: string;
  namespace?: string;
}

export interface CommonMetadata {
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
}

export interface IgnoreRule {
  paths: string[];
  target?: Selector;
}

export type BuildMetadataOption = "originAnnotations" | "transformerAnnotations";

export type KustomizationSpecDeletionPolicy = "MirrorPrune" | "Delete" | "WaitForTermination" | "Orphan";

export interface KustomizationSpec extends FluxCDKubeObjectSpecWithSuspend {
  commonMetadata?: CommonMetadata;
  dependsOn?: DependencyReference[];
  decryption?: Decryption;
  interval: string;
  retryInterval?: string;
  kubeConfig?: KubeConfigReference;
  path?: string;
  postBuild?: PostBuild;
  prune: boolean;
  deletionPolicy?: KustomizationSpecDeletionPolicy;
  healthChecks?: NamespacedObjectKindReference[];
  namePrefix?: string;
  nameSuffix?: string;
  patches?: Patch[];
  images?: Image[];
  serviceAccountName?: string;
  sourceRef: CrossNamespaceSourceReference;
  suspend?: boolean;
  targetNamespace?: string;
  timeout?: string;
  force?: boolean;
  wait?: boolean;
  buildMetadata?: BuildMetadataOption[];
  components?: string[];
  ignoreMissingComponents?: boolean;
  healthCheckExprs?: CustomHealthCheck[];
  ignore?: IgnoreRule[];
}

export interface KustomizationStatus extends FluxCDKubeObjectStatus {
  lastAppliedRevision?: string;
  lastAppliedOriginRevision?: string;
  lastAttemptedRevision?: string;
  inventory?: ResourceInventory;
  history?: History;
}

export class Kustomization extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  KustomizationStatus,
  KustomizationSpec
> {
  declare kind: "Kustomization";
  declare apiVersion: "kustomize.toolkit.fluxcd.io/v1";

  static readonly kind = "Kustomization";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/kustomize.toolkit.fluxcd.io/v1/kustomizations";

  static readonly crd: FluxCDKubeObjectCRD = {
    apiVersions: ["kustomize.toolkit.fluxcd.io/v1"],
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
    return getRefUrl(ref, object);
  }
}

export class KustomizationApi extends Renderer.K8sApi.KubeApi<Kustomization> {}
export class KustomizationStore extends Renderer.K8sApi.KubeObjectStore<Kustomization> {}
