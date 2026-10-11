import { Renderer } from "@freelensapp/extensions";

import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus, NamespacedObjectReference } from "../types";

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

export type ReflectionPolicy = "Always" | "IfNotPresent" | "Never";

export interface ImagePolicySpec extends FluxCDKubeObjectSpecWithSuspend {
  imageRepositoryRef: NamespacedObjectReference;
  policy: ImagePolicyChoice;
  filterTags?: TagFilter;
  digestReflectionPolicy?: ReflectionPolicy;
  interval?: string;
  suspend?: boolean;
}

export interface ImageRef {
  name: string;
  tag: string;
  digest?: string;
}

export interface ImagePolicyStatus extends FluxCDKubeObjectStatus {
  latestRef?: ImageRef;
  observedPreviousRef?: ImageRef;
}

export class ImagePolicy extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ImagePolicyStatus,
  ImagePolicySpec
> {
  declare kind: "ImagePolicy";
  declare apiVersion: "image.toolkit.fluxcd.io/v1";

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

  static getImage(ref?: ImageRef): string | undefined {
    if (!ref) return;
    return ref.digest ? `${ref.name}:${ref.tag}@${ref.digest}` : `${ref.name}:${ref.tag}`;
  }

  static getLatestTag(object: ImagePolicy): string | undefined {
    return object.status?.latestRef?.tag;
  }

  static getLatestImage(object: ImagePolicy): string | undefined {
    return ImagePolicy.getImage(object.status?.latestRef);
  }

  static getObservedPreviousImage(object: ImagePolicy): string | undefined {
    return ImagePolicy.getImage(object.status?.observedPreviousRef);
  }
}

export class ImagePolicyApi extends Renderer.K8sApi.KubeApi<ImagePolicy> {}
export class ImagePolicyStore extends Renderer.K8sApi.KubeObjectStore<ImagePolicy> {}
