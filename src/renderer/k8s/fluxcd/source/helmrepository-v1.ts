import { Renderer } from "@freelensapp/extensions";

import type { AccessFrom, Artifact, FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export type HelmRepositorySpecType = "default" | "oci";

export type HelmRepositorySpecProvider = "generic" | "aws" | "azure" | "gcp";

export interface HelmRepositorySpec extends FluxCDKubeObjectSpecWithSuspend {
  url: string;
  secretRef?: LocalObjectReference;
  certSecretRef?: LocalObjectReference;
  passCredentials?: boolean;
  interval?: string;
  insecure?: boolean;
  timeout?: string;
  suspend?: boolean;
  accessFrom?: AccessFrom;
  type?: HelmRepositorySpecType;
  provider?: HelmRepositorySpecProvider;
}

export interface HelmRepositoryStatus extends FluxCDKubeObjectStatus {
  url?: string;
  artifact?: Artifact;
}

export class HelmRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  HelmRepositoryStatus,
  HelmRepositorySpec
> {
  declare kind: "HelmRepository";
  declare apiVersion: "source.toolkit.fluxcd.io/v1";

  static readonly kind = "HelmRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1/helmrepositories";

  static readonly crd = {
    apiVersions: ["source.toolkit.fluxcd.io/v1"],
    plural: "helmrepositories",
    singular: "helmrepository",
    shortNames: ["helmrepo"],
    title: "Helm Repositories",
  };
}

export class HelmRepositoryApi extends Renderer.K8sApi.KubeApi<HelmRepository> {}
export class HelmRepositoryStore extends Renderer.K8sApi.KubeObjectStore<HelmRepository> {}
