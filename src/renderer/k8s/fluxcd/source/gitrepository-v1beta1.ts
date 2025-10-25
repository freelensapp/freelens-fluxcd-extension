import { Renderer } from "@freelensapp/extensions";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { AccessFrom, Artifact, FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

export interface GitRepositoryRef {
  branch?: string;
  tag?: string;
  semver?: string;
  commit?: string;
  name?: string;
}

export interface GitRepositoryInclude {
  repository: LocalObjectReference;
  fromPath: string;
  toPath: string;
}

export interface GitRepositorySpec extends FluxCDKubeObjectSpecWithSuspend {
  url: string;
  secretRef?: LocalObjectReference;
  interval: string;
  timeout?: string;
  ref?: GitRepositoryRef;
  verify?: { mode?: string; secretRef?: LocalObjectReference };
  ignore?: string;
  suspend?: boolean;
  gitImplementation?: "go-git" | "libgit2";
  recurseSubmodules?: boolean;
  include?: GitRepositoryInclude[];
  accessFrom?: AccessFrom;
}

export interface GitRepositoryStatus extends FluxCDKubeObjectStatus {
  url?: string;
  artifact?: Artifact;
  includedArtifacts?: Artifact[];
}

export class GitRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  GitRepositoryStatus,
  GitRepositorySpec
> {
  static readonly kind = "GitRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/gitrepositories";

  static readonly crd = {
    apiVersions: ["source.toolkit.fluxcd.io/v1beta1"],
    plural: "gitrepositories",
    singular: "gitrepository",
    shortNames: ["gitrepo"],
    title: "Git Repositories",
  };

  static getGitRef(ref?: GitRepositoryRef): string | undefined {
    if (!ref) return;
    return ref.name?.replace(/^refs\/(heads|tags)\//, "") ?? ref.branch ?? ref.tag ?? ref.semver ?? ref.commit;
  }

  static getGitRefFull(ref?: GitRepositoryRef): string | undefined {
    if (!ref) return;
    if (ref.name) return `name: ${ref.name}`;
    if (ref.branch) return `branch: ${ref.branch}`;
    if (ref.tag) return `tag: ${ref.tag}`;
    if (ref.semver) return `semver: ${ref.semver}`;
    if (ref.commit) return `commit: ${ref.commit}`;
    return;
  }

  static getGitRevision(object: GitRepository): string | undefined {
    return object.status?.artifact?.revision?.replace(/^refs\/(heads|tags)\//, "");
  }
}

export class GitRepositoryApi extends Renderer.K8sApi.KubeApi<GitRepository> {}
export class GitRepositoryStore extends Renderer.K8sApi.KubeObjectStore<GitRepository> {}
