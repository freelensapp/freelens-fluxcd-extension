import { Renderer } from "@freelensapp/extensions";

import type { Artifact, FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export type BucketSTSSpecProvider = "aws" | "ldap";

export interface BucketSTSSpec {
  provider: BucketSTSSpecProvider;
  endpoint: string;
  secretRef?: LocalObjectReference;
  certSecretRef?: LocalObjectReference;
}

export type BucketSpecProvider = "generic" | "aws" | "gcp" | "azure";

export interface BucketSpec extends FluxCDKubeObjectSpecWithSuspend {
  provider?: BucketSpecProvider;
  bucketName: string;
  endpoint: string;
  sts?: BucketSTSSpec;
  insecure?: boolean;
  region?: string;
  prefix?: string;
  secretRef?: LocalObjectReference;
  serviceAccountName?: string;
  certSecretRef?: LocalObjectReference;
  proxySecretRef?: LocalObjectReference;
  interval: string;
  timeout?: string;
  ignore?: string;
  suspend?: boolean;
}

export interface BucketStatus extends FluxCDKubeObjectStatus {
  url?: string;
  artifact?: Artifact;
  observedIgnore?: string;
}

export class Bucket extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  BucketStatus,
  BucketSpec
> {
  declare kind: "Bucket";
  declare apiVersion: "source.toolkit.fluxcd.io/v1";

  static readonly kind = "Bucket";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1/buckets";

  static readonly crd = {
    apiVersions: ["source.toolkit.fluxcd.io/v1"],
    plural: "buckets",
    singular: "bucket",
    shortNames: [],
    title: "Buckets",
  };
}

export class BucketApi extends Renderer.K8sApi.KubeApi<Bucket> {}
export class BucketStore extends Renderer.K8sApi.KubeObjectStore<Bucket> {}
