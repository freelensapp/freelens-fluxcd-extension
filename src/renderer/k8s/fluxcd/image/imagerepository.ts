import { Renderer } from "@freelensapp/extensions";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { AccessFrom, FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

export interface ScanResult {
  tagCount: number;
  scanTime?: string;
  // v1beta2
  latestTags: string[];
}

export interface ImageRepositorySpec extends FluxCDKubeObjectSpecWithSuspend {
  image?: string;
  interval: string;
  timeout?: string;
  secretRef?: LocalObjectReference;
  serviceAccountName?: string;
  certSecretRef?: LocalObjectReference;
  suspend?: boolean;
  accessFrom?: AccessFrom;
  exclusionList?: string[];
}

export interface ImageRepositoryStatus extends FluxCDKubeObjectStatus {
  canonicalImageName?: string;
  lastScanResult?: ScanResult;
}

export class ImageRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ImageRepositoryStatus,
  ImageRepositorySpec
> {
  static readonly kind = "ImageRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/image.toolkit.fluxcd.io/v1beta1/imagerepositories";

  static readonly crd = {
    apiVersions: ["image.toolkit.fluxcd.io/v1beta1", "image.toolkit.fluxcd.io/v1beta2"],
    plural: "imagerepositories",
    singular: "imagerepository",
    shortNames: [],
    title: "Image Repositories",
  };
}

export class ImageRepositoryApi extends Renderer.K8sApi.KubeApi<ImageRepository> {}
export class ImageRepositoryStore extends Renderer.K8sApi.KubeObjectStore<ImageRepository> {}
