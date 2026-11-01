import { Renderer } from "@freelensapp/extensions";

import type { AccessFrom, FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export interface ScanResult {
  revision?: string;
  tagCount: number;
  scanTime?: string;
  latestTags?: string[];
}

export type ImageRepositorySpecProvider = "generic" | "aws" | "azure" | "gcp";

export interface ImageRepositorySpec extends FluxCDKubeObjectSpecWithSuspend {
  image: string;
  interval: string;
  timeout?: string;
  secretRef?: LocalObjectReference;
  proxySecretRef?: LocalObjectReference;
  serviceAccountName?: string;
  certSecretRef?: LocalObjectReference;
  suspend?: boolean;
  accessFrom?: AccessFrom;
  exclusionList?: string[];
  provider?: ImageRepositorySpecProvider;
  insecure?: boolean;
}

export interface ImageRepositoryStatus extends FluxCDKubeObjectStatus {
  canonicalImageName?: string;
  lastScanResult?: ScanResult;
  observedExclusionList?: string[];
}

export class ImageRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ImageRepositoryStatus,
  ImageRepositorySpec
> {
  declare kind: "ImageRepository";
  declare apiVersion: "image.toolkit.fluxcd.io/v1";

  static readonly kind = "ImageRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/image.toolkit.fluxcd.io/v1/imagerepositories";

  static readonly crd = {
    apiVersions: ["image.toolkit.fluxcd.io/v1"],
    plural: "imagerepositories",
    singular: "imagerepository",
    shortNames: [],
    title: "Image Repositories",
  };
}

export class ImageRepositoryApi extends Renderer.K8sApi.KubeApi<ImageRepository> {}
export class ImageRepositoryStore extends Renderer.K8sApi.KubeObjectStore<ImageRepository> {}
