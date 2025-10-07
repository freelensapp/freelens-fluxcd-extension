import { Renderer } from "@freelensapp/extensions";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { Artifact, FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

export interface OCIRepositoryRef {
  digest?: string;
  semver?: string;
  semverFilter?: string;
  tag?: string;
}

export interface OCILayerSelector {
  mediaType?: string;
  operation?: "extract" | "copy";
}

export interface OIDCIdentityMatch {
  issuer: string;
  subject: string;
}

export interface OCIRepositoryVerification {
  provider: "cosign";
  secretRef?: LocalObjectReference;
  matchOIDCIdentity?: OIDCIdentityMatch[];
}

export interface OCIRepositorySpec extends FluxCDKubeObjectSpecWithSuspend {
  url: string;
  ref?: OCIRepositoryRef;
  layerSelector?: OCILayerSelector;
  provider?: "generic" | "aws" | "azure" | "gcp";
  secretRef?: LocalObjectReference;
  verify?: OCIRepositoryVerification;
  serviceAccountName?: string;
  certSecretRef?: LocalObjectReference;
  proxySecretRef?: LocalObjectReference;
  interval: string;
  timeout?: string;
  insecure?: boolean;
  suspend?: boolean;
}

export interface OCIRepositoryStatus extends FluxCDKubeObjectStatus {
  url?: string;
  artifact?: Artifact;
  contentConfigChecksum?: string;
  observedIgnore?: string;
  observedLayerSelector?: OCILayerSelector;
}

export class OCIRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  OCIRepositoryStatus,
  OCIRepositorySpec
> {
  static readonly kind = "OCIRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1/ocirepositories";

  static readonly crd = {
    apiVersions: ["source.toolkit.fluxcd.io/v1"],
    plural: "ocirepositories",
    singular: "ocirepository",
    shortNames: ["ocirepo"],
    title: "OCI Repositories",
  };
}

export class OCIRepositoryApi extends Renderer.K8sApi.KubeApi<OCIRepository> {}
export class OCIRepositoryStore extends Renderer.K8sApi.KubeObjectStore<OCIRepository> {}
