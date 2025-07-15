import { Renderer } from "@freelensapp/extensions";

export class HelmRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  any,
  any,
  { url: string; interval: string; timeout: string; suspend: boolean }
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
