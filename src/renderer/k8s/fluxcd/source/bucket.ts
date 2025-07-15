import { Renderer } from "@freelensapp/extensions";
import { getApi, getStore } from "../stores";

export class Bucket extends Renderer.K8sApi.KubeObject<any, any, { url: string }> {
  static readonly kind = "Bucket";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/buckets";

  static readonly crd = {
    apiVersions: [
      "source.toolkit.fluxcd.io/v1beta1",
      "source.toolkit.fluxcd.io/v1beta2",
      "source.toolkit.fluxcd.io/v1",
    ],
    plural: "buckets",
    singular: "bucket",
    shortNames: [],
    title: "Buckets",
  };

  static getApi = getApi;
  static getStore = getStore;
}

export class BucketApi extends Renderer.K8sApi.KubeApi<Bucket> {}
export class BucketStore extends Renderer.K8sApi.KubeObjectStore<Bucket> {}
