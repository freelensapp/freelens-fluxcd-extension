import { Renderer } from "@freelensapp/extensions";

import type { Artifact, FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export interface OCIRepositoryRef {
  digest?: string;
  semver?: string;
  semverFilter?: string;
  tag?: string;
}

export type OCILayerSelectorOperation = "extract" | "copy";

export interface OCILayerSelector {
  mediaType?: string;
  operation?: OCILayerSelectorOperation;
}

export interface OIDCIdentityMatch {
  issuer: string;
  subject: string;
}

export type OCIRepositoryVerificationProvider = "cosign" | "notation";

export interface OCIRepositoryVerification {
  provider: OCIRepositoryVerificationProvider;
  secretRef?: LocalObjectReference;
  matchOIDCIdentity?: OIDCIdentityMatch[];
  trustedRootSecretRef?: LocalObjectReference;
}

export type OCIRepositoryProvider = "generic" | "aws" | "azure" | "gcp";

export interface OCIRepositorySpec extends FluxCDKubeObjectSpecWithSuspend {
  // Optional in the Go type since source-controller v1.10, so that a HelmRelease can embed the struct, and required
  // by a validation rule of the OCIRepository CRD.
  url: string;
  ref?: OCIRepositoryRef;
  layerSelector?: OCILayerSelector;
  provider?: OCIRepositoryProvider;
  secretRef?: LocalObjectReference;
  verify?: OCIRepositoryVerification;
  serviceAccountName?: string;
  certSecretRef?: LocalObjectReference;
  proxySecretRef?: LocalObjectReference;
  // Required by a validation rule of the CRD, as url.
  interval: string;
  timeout?: string;
  ignore?: string;
  insecure?: boolean;
  suspend?: boolean;
}

export interface OCIRepositoryStatus extends FluxCDKubeObjectStatus {
  url?: string;
  artifact?: Artifact;
  observedIgnore?: string;
  observedLayerSelector?: OCILayerSelector;
  sourceVerificationFingerprint?: string;
}

export class OCIRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  OCIRepositoryStatus,
  OCIRepositorySpec
> {
  declare kind: "OCIRepository";
  declare apiVersion: "source.toolkit.fluxcd.io/v1";

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
