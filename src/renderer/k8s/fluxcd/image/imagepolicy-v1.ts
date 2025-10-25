import { Renderer } from "@freelensapp/extensions";

import type { FluxCDKubeObjectStatus, NamespacedObjectReference } from "../types";

export interface SemVerPolicy {
  range: string;
}

export interface AlphabeticalPolicy {
  order?: "asc" | "desc";
}

export interface NumericalPolicy {
  order?: "asc" | "desc";
}

export interface ImagePolicyChoice {
  semver?: SemVerPolicy;
  alphabetical?: AlphabeticalPolicy;
  numerical?: NumericalPolicy;
}

export interface TagFilter {
  pattern: string;
  extract: string;
}

export interface ImagePolicySpec {
  imageRepositoryRef: NamespacedObjectReference;
  policy: ImagePolicyChoice;
  filterTags?: TagFilter;
}

export interface ImagePolicyStatus extends FluxCDKubeObjectStatus {
  latestImage?: string;
}

export class ImagePolicy extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ImagePolicyStatus,
  ImagePolicySpec
> {
  static readonly kind = "ImagePolicy";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/image.toolkit.fluxcd.io/v1/imagepolicies";

  static readonly crd = {
    apiVersions: ["image.toolkit.fluxcd.io/v1"],
    plural: "imagepolicies",
    singular: "imagepolicy",
    shortNames: [],
    title: "Image Policies",
  };
}

export class ImagePolicyApi extends Renderer.K8sApi.KubeApi<ImagePolicy> {}
export class ImagePolicyStore extends Renderer.K8sApi.KubeObjectStore<ImagePolicy> {}
