import { Renderer } from "@freelensapp/extensions";
import { getRefUrl } from "../utils";

import type { FluxCDKubeObjectCRD, NamespacedObjectKindReference } from "../types";

type Condition = Renderer.K8sApi.Condition;

export const sourceWatcherReconcileAnnotation = "source.extensions.fluxcd.io/reconcile";

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
  lastHandledReconcileAt?: string;
  conditions?: Condition[];
  inventory?: ExternalArtifactReference[];
  observedSourcesDigest?: string;
}

export class ArtifactGenerator extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ArtifactGeneratorStatus,
  ArtifactGeneratorSpec
> {
  declare kind: "ArtifactGenerator";
  declare apiVersion: "source.extensions.fluxcd.io/v1beta1";

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

  static getSourceRefText(source: SourceReference): string {
    return [source.kind, ": ", source.namespace ? `${source.namespace}/` : "", source.name].join("");
  }

  static getSourceRefUrl(source: SourceReference, object: ArtifactGenerator): string | undefined {
    const ref: NamespacedObjectKindReference = { kind: source.kind, name: source.name, namespace: source.namespace };
    return getRefUrl(ref, object);
  }

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
