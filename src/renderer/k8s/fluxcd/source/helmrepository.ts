import { Renderer } from "@freelensapp/extensions";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { AccessFrom, Artifact, FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

export interface HelmRepositoryRef {
  branch?: string;
  tag?: string;
  semver?: string;
  commit?: string;
  name?: string;
}

export interface HelmRepositoryInclude {
  repository: LocalObjectReference;
  fromPath: string;
  toPath: string;
}

export interface HelmRepositorySpec extends FluxCDKubeObjectSpecWithSuspend {
  url: string;
  secretRef?: LocalObjectReference;
  passCredentials?: boolean;
  interval: string;
  timeout?: string;
  suspend?: boolean;
  accessFrom?: AccessFrom;
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
  static readonly kind = "HelmRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/helmrepositories";

  static readonly crd = {
    apiVersions: [
      "source.toolkit.fluxcd.io/v1beta1",
      "source.toolkit.fluxcd.io/v1beta2",
      "source.toolkit.fluxcd.io/v1",
    ],
    plural: "helmrepositories",
    singular: "helmrepository",
    shortNames: ["helmrepo"],
    title: "Helm Repositories",
  };
}

export class HelmRepositoryApi extends Renderer.K8sApi.KubeApi<HelmRepository> {}
export class HelmRepositoryStore extends Renderer.K8sApi.KubeObjectStore<HelmRepository> {}
