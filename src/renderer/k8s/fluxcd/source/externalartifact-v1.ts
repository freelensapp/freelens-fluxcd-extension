import { Renderer } from "@freelensapp/extensions";
import { getRefUrl } from "../utils";

import type { Artifact, FluxCDKubeObjectCRD, NamespacedObjectKindReference } from "../types";

type Condition = Renderer.K8sApi.Condition;

export interface ExternalArtifactSpec {
  sourceRef?: NamespacedObjectKindReference;
}

export interface ExternalArtifactStatus {
  artifact?: Artifact;
  conditions?: Condition[];
}

/**
 * An artifact that a controller other than source-controller produces, such as the ArtifactGenerator of
 * source-watcher. Its producer reconciles it: it has no `spec.interval` and no `spec.suspend`.
 */
export class ExternalArtifact extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ExternalArtifactStatus,
  ExternalArtifactSpec
> {
  static readonly kind = "ExternalArtifact";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1/externalartifacts";

  static readonly crd: FluxCDKubeObjectCRD = {
    apiVersions: ["source.toolkit.fluxcd.io/v1"],
    plural: "externalartifacts",
    singular: "externalartifact",
    shortNames: ["ea"],
    title: "External Artifacts",
  };

  static getSourceRefText(object: ExternalArtifact): string | undefined {
    const ref = object.spec?.sourceRef;
    if (!ref) return;
    return [ref.kind, ": ", ref.namespace ? `${ref.namespace}/` : "", ref.name].join("");
  }

  static getSourceRefUrl(object: ExternalArtifact): string | undefined {
    const ref = object.spec?.sourceRef;
    if (!ref) return;
    return getRefUrl(ref, object);
  }
}

export class ExternalArtifactApi extends Renderer.K8sApi.KubeApi<ExternalArtifact> {}
export class ExternalArtifactStore extends Renderer.K8sApi.KubeObjectStore<ExternalArtifact> {}
