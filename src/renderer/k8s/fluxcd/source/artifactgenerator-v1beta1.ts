import { Renderer } from "@freelensapp/extensions";
import { getRefUrl } from "../utils";

import type { FluxCDKubeObjectCRD, NamespacedObjectKindReference } from "../types";

type Condition = Renderer.K8sApi.Condition;

/**
 * The types follow `api/v1beta1/artifactgenerator_types.go` of fluxcd/source-watcher at v2.2.4, and
 * `meta.ReconcileRequestStatus` of fluxcd/pkg `apis/meta` v1.30.2.
 */

export interface CommonMetadata {
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
}

export type SourceReferenceKind = "Bucket" | "GitRepository" | "OCIRepository" | "HelmChart" | "ExternalArtifact";

export interface SourceReference {
  alias: string;
  name: string;
  namespace?: string;
  kind: SourceReferenceKind;
}

export type CopyStrategy = "Overwrite" | "Merge" | "Extract";

export interface CopyOperation {
  from: string;
  to: string;
  exclude?: string[];
  strategy?: CopyStrategy;
}

export interface OutputArtifact {
  name: string;
  revision?: string;
  originRevision?: string;
  copy: CopyOperation[];
}

export interface ArtifactGeneratorSpec {
  commonMetadata?: CommonMetadata;
  sources: SourceReference[];
  pathPattern?: string;
  artifacts: OutputArtifact[];
}

export interface ExternalArtifactReference {
  name: string;
  namespace: string;
  digest: string;
  filename: string;
}

export interface ArtifactGeneratorStatus {
  // ReconcileRequestStatus:
  lastHandledReconcileAt?: string;
  // ArtifactGeneratorStatus:
  conditions?: Condition[];
  inventory?: ExternalArtifactReference[];
  observedSourcesDigest?: string;
}

/**
 * Composes and decomposes sources into ExternalArtifact objects, reconciled by source-watcher. It has no
 * `spec.suspend`: the annotation `source.extensions.fluxcd.io/reconcile: disabled` suspends it.
 */
export class ArtifactGenerator extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ArtifactGeneratorStatus,
  ArtifactGeneratorSpec
> {
  static readonly kind = "ArtifactGenerator";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.extensions.fluxcd.io/v1beta1/artifactgenerators";

  static readonly crd: FluxCDKubeObjectCRD = {
    apiVersions: ["source.extensions.fluxcd.io/v1beta1"],
    plural: "artifactgenerators",
    singular: "artifactgenerator",
    shortNames: ["ag"],
    title: "Artifact Generators",
  };

  /**
   * The annotation that disables the reconciliation with the value `disabled` and enables it with `enabled`
   * (`ReconcileAnnotation`, `DisabledValue` and `EnabledValue`).
   */
  static readonly reconcileAnnotation = "source.extensions.fluxcd.io/reconcile";

  /**
   * Whether the reconciliation of the object is disabled by its annotation, as `IsDisabled` tells it: the value
   * `disabled` in any case.
   */
  static isReconcileDisabled(object: { metadata: Renderer.K8sApi.KubeObjectMetadata }): boolean {
    return object.metadata.annotations?.[ArtifactGenerator.reconcileAnnotation]?.toLowerCase() === "disabled";
  }

  static getSourceRefText(source: SourceReference): string {
    return [source.kind, ": ", source.namespace ? `${source.namespace}/` : "", source.name].join("");
  }

  /**
   * Links the source, without an `apiVersion` like every Flux reference, to the version the cluster serves for its
   * kind, in the namespace of the object when the source has none.
   */
  static getSourceRefUrl(source: SourceReference, object: ArtifactGenerator): string | undefined {
    const ref: NamespacedObjectKindReference = { kind: source.kind, name: source.name, namespace: source.namespace };
    return getRefUrl(ref, object);
  }

  /**
   * Links an inventory entry to the ExternalArtifact it names, in the version the cluster serves.
   */
  static getInventoryRefUrl(entry: ExternalArtifactReference, object: ArtifactGenerator): string | undefined {
    const ref: NamespacedObjectKindReference = {
      kind: "ExternalArtifact",
      name: entry.name,
      namespace: entry.namespace,
    };
    return getRefUrl(ref, object);
  }
}

export class ArtifactGeneratorApi extends Renderer.K8sApi.KubeApi<ArtifactGenerator> {}
export class ArtifactGeneratorStore extends Renderer.K8sApi.KubeObjectStore<ArtifactGenerator> {}
