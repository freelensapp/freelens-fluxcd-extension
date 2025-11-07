import { Renderer } from "@freelensapp/extensions";

import type { Condition } from "@freelensapp/kube-object";

export interface ResourceSetInput {
  [key: string]: any;
}

export interface Schedule {
  cron: string;
  timeZone?: string;
  window?: string;
}

export interface NextSchedule extends Schedule {
  when: string;
}

export interface ResourceSetInputFilter {
  includeBranch?: string;
  excludeBranch?: string;
  includeTag?: string;
  excludeTag?: string;
  labels?: string[];
  limit?: number;
  semver?: string;
}

export interface ResourceSetInputSkip {
  labels?: string[];
}

export interface LocalObjectReference {
  name: string;
}

export interface ResourceSetInputProviderSpec {
  type: string;
  url?: string;
  serviceAccountName?: string;
  secretRef?: LocalObjectReference;
  certSecretRef?: LocalObjectReference;
  defaultValues?: ResourceSetInput;
  filter?: ResourceSetInputFilter;
  skip?: ResourceSetInputSkip;
  schedule?: Schedule[];
}

export interface ResourceSetInputProviderStatus {
  lastHandledReconcileAt?: string;
  lastHandledForceAt?: string;
  conditions?: Condition[];
  exportedInputs?: ResourceSetInput[];
  lastExportedRevision?: string;
  nextSchedule?: NextSchedule;
}

export class ResourceSetInputProvider extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ResourceSetInputProviderStatus,
  ResourceSetInputProviderSpec
> {
  static readonly kind = "ResourceSetInputProvider";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/fluxcd.controlplane.io/v1/resourcesetinputproviders";

  static readonly crd = {
    apiVersions: ["fluxcd.controlplane.io/v1"],
    plural: "resourcesetinputproviders",
    singular: "resourcesetinputprovider",
    shortNames: ["rsip"],
    title: "Resource Set Input Providers",
  };
}

export class ResourceSetInputProviderApi extends Renderer.K8sApi.KubeApi<ResourceSetInputProvider> {}
export class ResourceSetInputProviderStore extends Renderer.K8sApi.KubeObjectStore<ResourceSetInputProvider> {}
