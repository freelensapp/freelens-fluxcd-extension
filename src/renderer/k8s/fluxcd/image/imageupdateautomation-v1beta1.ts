import { Renderer } from "@freelensapp/extensions";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { GitRepositoryRef } from "../source/gitrepository-v1";
import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus, NamespacedObjectKindReference } from "../types";

export interface GitCheckoutSpec {
  ref: GitRepositoryRef;
}

export interface CommitUser {
  name?: string;
  email: string;
}

export interface SigningKey {
  secretRef?: LocalObjectReference;
}

export interface CommitSpec {
  author?: CommitUser;
  signingKey?: SigningKey;
  messageTemplate?: string;
}

export interface PushSpec {
  branch?: string;
  refspec?: string;
  options?: Record<string, string>;
}

export interface GitSpec {
  checkout?: GitCheckoutSpec;
  commit?: CommitSpec;
  push?: PushSpec;
}

export interface UpdateStrategy {
  strategy: string;
  path?: string;
}

export interface ImageRef {
  name: string;
  tag: string;
  digest?: string;
}

export interface ImageUpdateAutomationSpec extends FluxCDKubeObjectSpecWithSuspend {
  sourceRef: NamespacedObjectKindReference;
  git?: GitSpec;
  interval: string;
  update?: UpdateStrategy;
  suspend?: boolean;
}

export interface ImageUpdateAutomationStatus extends FluxCDKubeObjectStatus {
  lastAutomationRunTime?: string;
  lastPushCommit?: string;
  lastPushTime?: string;
  // v1beta2
  observedPolicies?: Record<string, ImageRef>;
}

export class ImageUpdateAutomation extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ImageUpdateAutomationStatus,
  ImageUpdateAutomationSpec
> {
  static readonly kind = "ImageUpdateAutomation";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/image.toolkit.fluxcd.io/v1beta1/imageupdateautomations";

  static readonly crd = {
    apiVersions: ["image.toolkit.fluxcd.io/v1beta1"],
    plural: "imageupdateautomations",
    singular: "imageupdateautomation",
    shortNames: [],
    title: "Image Update Automations",
  };

  static getCommitAuthor(object: ImageUpdateAutomation): string | undefined {
    const { email, name } = object.spec.git?.commit?.author ?? {};
    if (!email) return;
    return name ? `${name} <${email}>` : email;
  }
}

export class ImageUpdateAutomationApi extends Renderer.K8sApi.KubeApi<ImageUpdateAutomation> {}
export class ImageUpdateAutomationStore extends Renderer.K8sApi.KubeObjectStore<ImageUpdateAutomation> {}
