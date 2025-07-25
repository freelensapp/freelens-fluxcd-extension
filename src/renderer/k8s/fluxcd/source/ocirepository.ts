import { Renderer } from "@freelensapp/extensions";

export class OCIRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  any,
  any,
  { url: string; suspend?: boolean }
> {
  static readonly kind = "OCIRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta2/ocirepositories";

  static readonly crd = {
    apiVersions: [
      "source.toolkit.fluxcd.io/v1beta1",
      "source.toolkit.fluxcd.io/v1beta2",
      "source.toolkit.fluxcd.io/v1",
    ],
    plural: "ocirepositories",
    singular: "ocirepository",
    shortNames: ["ocirepo"],
    title: "OCI Repositories",
  };
}

export class OCIRepositoryApi extends Renderer.K8sApi.KubeApi<OCIRepository> {}
export class OCIRepositoryStore extends Renderer.K8sApi.KubeObjectStore<OCIRepository> {}
