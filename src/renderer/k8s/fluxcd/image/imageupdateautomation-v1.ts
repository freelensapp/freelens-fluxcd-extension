import { Renderer } from "@freelensapp/extensions";

import type { GitRepositoryRef } from "../source/gitrepository-v1";
import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../types";

type LabelSelector = Renderer.K8sApi.LabelSelector;
type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export type CrossNamespaceSourceReferenceKind = "GitRepository";

export interface CrossNamespaceSourceReference {
  apiVersion?: string;
  kind: CrossNamespaceSourceReferenceKind;
  name: string;
  namespace?: string;
}

export interface GitCheckoutSpec {
  ref: GitRepositoryRef;
}

export interface CommitUser {
  name?: string;
  email: string;
}

export type SigningKeyType = "gpg" | "ssh";

export interface SigningKey {
  secretRef: LocalObjectReference;
  type?: SigningKeyType;
}

export interface CommitSpec {
  author: CommitUser;
  signingKey?: SigningKey;
  messageTemplate?: string;
  messageTemplateValues?: Record<string, string>;
}

export interface PushSpec {
  branch?: string;
  refspec?: string;
  options?: Record<string, string>;
}

export interface GitSpec {
  checkout?: GitCheckoutSpec;
  commit: CommitSpec;
  push?: PushSpec;
}

export type UpdateStrategyName = "Setters";

export interface UpdateStrategy {
  strategy?: UpdateStrategyName;
  path?: string;
}

export interface ImageRef {
  name: string;
  tag: string;
  digest?: string;
}

export type ObservedPolicies = Record<string, ImageRef>;

export interface ImageUpdateAutomationSpec extends FluxCDKubeObjectSpecWithSuspend {
  sourceRef: CrossNamespaceSourceReference;
  git?: GitSpec;
  interval: string;
  policyChangeDelay?: string;
  policySelector?: LabelSelector;
  update?: UpdateStrategy;
  suspend?: boolean;
}

export interface ImageUpdateAutomationStatus extends FluxCDKubeObjectStatus {
  lastAutomationRunTime?: string;
  lastPushCommit?: string;
  lastPushTime?: string;
  observedPolicies?: ObservedPolicies;
  observedSourceRevision?: string;
}

export class ImageUpdateAutomation extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ImageUpdateAutomationStatus,
  ImageUpdateAutomationSpec
> {
  declare kind: "ImageUpdateAutomation";
  declare apiVersion: "image.toolkit.fluxcd.io/v1";

  static readonly kind = "ImageUpdateAutomation";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/image.toolkit.fluxcd.io/v1/imageupdateautomations";

  static readonly crd = {
    apiVersions: ["image.toolkit.fluxcd.io/v1"],
    plural: "imageupdateautomations",
    singular: "imageupdateautomation",
    shortNames: [],
    title: "Image Update Automations",
  };

  static getCommitAuthor(object: ImageUpdateAutomation): string | undefined {
    const { email, name } = object.spec.git?.commit.author ?? {};
    if (!email) return;
    return name ? `${name} <${email}>` : email;
  }
}

export class ImageUpdateAutomationApi extends Renderer.K8sApi.KubeApi<ImageUpdateAutomation> {}
export class ImageUpdateAutomationStore extends Renderer.K8sApi.KubeObjectStore<ImageUpdateAutomation> {}
