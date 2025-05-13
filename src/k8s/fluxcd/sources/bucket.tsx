import { Renderer } from "@freelensapp/extensions";

const { KubeApi } = Renderer.K8sApi;

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class Bucket extends KubeObject<any, any, { url: string }> {
  static readonly kind = "Bucket";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/buckets";
}

export class BucketApi extends KubeApi<Bucket> {}

export const bucketApi = new BucketApi({ objectConstructor: Bucket });
export class BucketStore extends KubeObjectStore<Bucket> {
  api: Renderer.K8sApi.KubeApi<Bucket> = bucketApi;
}

export const bucketStore = new BucketStore();

Renderer.K8sApi.apiManager.registerStore(bucketStore);
