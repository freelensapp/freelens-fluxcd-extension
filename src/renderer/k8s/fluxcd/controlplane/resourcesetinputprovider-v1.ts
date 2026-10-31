import { Renderer } from "@freelensapp/extensions";

type Condition = Renderer.K8sApi.Condition;
type LabelSelector = Renderer.K8sApi.LabelSelector;
type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

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
  includeEnvironment?: string;
  excludeEnvironment?: string;
  labels?: string[];
  limit?: number;
  semver?: string;
}

export interface ResourceSetInputSkip {
  labels?: string[];
}

export interface ExternalArtifactSelector extends LabelSelector {
  name?: string;
  namespace?: string;
}

export type ResourceSetInputProviderSpecType =
  | "Static"
  | "GitHubBranch"
  | "GitHubTag"
  | "GitHubPullRequest"
  | "GitLabBranch"
  | "GitLabTag"
  | "GitLabMergeRequest"
  | "GitLabEnvironment"
  | "AzureDevOpsBranch"
  | "AzureDevOpsTag"
  | "AzureDevOpsPullRequest"
  | "AWSCodeCommitBranch"
  | "AWSCodeCommitTag"
  | "AWSCodeCommitPullRequest"
  | "GiteaBranch"
  | "GiteaTag"
  | "GiteaPullRequest"
  | "OCIArtifactTag"
  | "ACRArtifactTag"
  | "ECRArtifactTag"
  | "GARArtifactTag"
  | "ExternalService"
  | "ExternalArtifact";

export interface ResourceSetInputProviderSpec {
  type: ResourceSetInputProviderSpecType;
  url?: string;
  serviceAccountName?: string;
  secretRef?: LocalObjectReference;
  certSecretRef?: LocalObjectReference;
  insecure?: boolean;
  defaultValues?: ResourceSetInput;
  filter?: ResourceSetInputFilter;
  skip?: ResourceSetInputSkip;
  schedule?: Schedule[];
  selectors?: ExternalArtifactSelector[];
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
  declare kind: "ResourceSetInputProvider";
  declare apiVersion: "fluxcd.controlplane.io/v1";

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
