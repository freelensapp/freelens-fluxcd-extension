import { Renderer } from "@freelensapp/extensions";

export class GitRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  any,
  any,
  {
    url: string;
    interval: string;
    timeout: string;
    suspend: boolean;
    ref: {
      branch: string;
      tag: string;
      semver: string;
      name: string;
      commit: string;
    };
  }
> {
  static readonly kind = "GitRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/gitrepositories";

  static readonly crd = {
    apiVersions: [
      "source.toolkit.fluxcd.io/v1beta1",
      "source.toolkit.fluxcd.io/v1beta2",
      "source.toolkit.fluxcd.io/v1",
    ],
    plural: "gitrepositories",
    singular: "gitrepository",
    shortNames: [],
    title: "Git Repositories",
  };
}

export class GitRepositoryApi extends Renderer.K8sApi.KubeApi<GitRepository> {}
export class GitRepositoryStore extends Renderer.K8sApi.KubeObjectStore<GitRepository> {}
