import { Renderer } from "@freelensapp/extensions";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { Artifact, FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

export interface BucketSpec extends FluxCDKubeObjectSpecWithSuspend {
  provider?: "generic" | "aws" | "azure" | "gcp";
  bucketName: string;
  endpoint: string;
  insecure?: boolean;
  region?: string;
  secretRef?: LocalObjectReference;
  interval: string;
  timeout?: string;
  suspend?: boolean;
}

export interface BucketStatus extends FluxCDKubeObjectStatus {
  url?: string;
  artifact?: Artifact;
}

export class Bucket extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  BucketStatus,
  BucketSpec
> {
  static readonly kind = "Bucket";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/buckets";

  static readonly crd = {
    apiVersions: ["source.toolkit.fluxcd.io/v1beta1"],
    plural: "buckets",
    singular: "bucket",
    shortNames: [],
    title: "Buckets",
  };
}

export class BucketApi extends Renderer.K8sApi.KubeApi<Bucket> {}
export class BucketStore extends Renderer.K8sApi.KubeObjectStore<Bucket> {}
