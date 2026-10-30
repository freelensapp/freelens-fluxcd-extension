import { Renderer } from "@freelensapp/extensions";
import {
  type FluxCDKubeObjectCRD,
  type FluxCDKubeObjectSpecWithSuspend,
  type FluxCDKubeObjectStatus,
  Image,
  JSON6902Patch,
  type KubeConfigReference,
  NamespacedObjectKindReference,
  NamespacedObjectReference,
} from "../types";
import { getRefUrl } from "../utils";

import type { Patch, Selector } from "../../core/types";
import type { OCIRepositorySpec } from "../source/ocirepository-v1";

export interface HelmReleaseSnapshot {
  apiVersion?: string;
  digest: string;
  name: string;
  namespace: string;
  version: number;
  status: string;
  chartName: string;
  chartVersion: string;
  appVersion?: string;
  configDigest: string;
  firstDeployed: string;
  lastDeployed: string;
  deleted?: string;
  testHooks?: {
    lastStarted?: string;
    lastCompleted?: string;
    phase?: string;
  }[];
}

export interface HelmChartTemplateObjectMeta {
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export type CrossNamespaceObjectReferenceKind = "HelmRepository" | "GitRepository" | "Bucket";

export interface CrossNamespaceObjectReference {
  apiVersion?: string;
  kind: CrossNamespaceObjectReferenceKind;
  name: string;
  namespace?: string;
}

/**
 * The template of the generated object. It has the fields of an `OCIRepositorySpec` inline, every one optional: a
 * `HelmChart` template uses `interval`, `verify` and `suspend` of them, an `OCIRepository` template all of them, with
 * `url` required by a validation rule of the CRD. `chart` and `sourceRef` are required, by another rule, unless the
 * template generates an `OCIRepository`, which in turn forbids them.
 */
export interface HelmChartTemplateSpec extends Partial<OCIRepositorySpec> {
  chart?: string;
  version?: string;
  sourceRef?: CrossNamespaceObjectReference;
  reconcileStrategy?: string;
  valuesFiles?: string[];
  valuesFile?: string;
}

export type HelmChartTemplateKind = "HelmChart" | "OCIRepository";

export interface HelmChartTemplate {
  kind?: HelmChartTemplateKind;
  metadata?: HelmChartTemplateObjectMeta;
  spec: HelmChartTemplateSpec;
}

export type HelmChartReferenceKind = "HelmChart" | "OCIRepository" | "ExternalArtifact";

export interface HelmChartReference {
  kind: HelmChartReferenceKind;
  name: string;
  namespace: string;
}

export interface IgnoreRule {
  paths: string[];
  target?: Selector;
}

export interface DriftDetection {
  mode?: string;
  ignore?: IgnoreRule[];
}

export interface InstallRemediation {
  retries?: number;
  ignoreTestFailures?: boolean;
  remediateLastFailure?: boolean;
}

export interface Install {
  timeout?: string;
  remediation?: InstallRemediation;
  disableWait?: boolean;
  disableWaitForJobs?: boolean;
  disableHooks?: boolean;
  disableOpenAPIValidation?: boolean;
  replace?: boolean;
  skipCRDs?: boolean;
  crds?: "Skip" | "Create" | "CreateReplace";
  createNamespace?: boolean;
}

export interface UpgradeRemediation {
  retries?: number;
  ignoreTestFailures?: boolean;
  remediateLastFailure?: boolean;
  strategy?: "rollback" | "uninstall";
}

export interface Upgrade {
  timeout?: string;
  remediation?: UpgradeRemediation;
  disableWait?: boolean;
  disableWaitForJobs?: boolean;
  disableHooks?: boolean;
  disableOpenAPIValidation?: boolean;
  force?: boolean;
  preserveValues?: boolean;
  cleanupOnFail?: boolean;
  crds?: "Skip" | "Create" | "CreateReplace";
}

export interface Filter {
  name: string;
  exclude?: boolean;
}

export interface Test {
  enable?: boolean;
  timeout?: string;
  ignoreFailures?: boolean;
  filters?: Filter[];
}

export interface Rollback {
  timeout?: string;
  disableWait?: boolean;
  disableWaitForJobs?: boolean;
  disableHooks?: boolean;
  recreate?: boolean;
  force?: boolean;
  cleanupOnFail?: boolean;
}

export interface Uninstall {
  timeout?: string;
  disableHooks?: boolean;
  keepHistory?: boolean;
  disableWait?: boolean;
  deletionPropagation?: "background" | "foreground" | "orphan";
}

export interface ValuesReference {
  kind: string;
  name: string;
  valuesKey?: string;
  targetPath?: string;
  optional?: boolean;
}

export interface Kustomize {
  patches?: Patch[];
  patchesStrategicMerge?: string[];
  patchesJson6902?: JSON6902Patch[];
  images?: Image[];
}

export interface PostRenderer {
  kustomize?: Kustomize;
}

export type CrossNamespaceSourceReferenceKind = "OCIRepository" | "HelmChart" | "ExternalArtifact";

export interface CrossNamespaceSourceReference {
  apiVersion?: string;
  kind: CrossNamespaceSourceReferenceKind;
  name: string;
  namespace?: string;
}

export interface HelmReleaseSpec extends FluxCDKubeObjectSpecWithSuspend {
  chart?: HelmChartTemplate;
  chartRef?: CrossNamespaceSourceReference;
  interval: string;
  kubeConfig?: KubeConfigReference;
  suspend?: boolean;
  releaseName?: string;
  targetNamespace?: string;
  storageNamespace?: string;
  dependsOn?: NamespacedObjectReference[];
  timeout?: string;
  maxHistory?: number;
  serviceAccountName?: string;
  persistentClient?: boolean;
  driftDetection?: DriftDetection;
  install?: Install;
  upgrade?: Upgrade;
  test?: Test;
  rollback?: Rollback;
  uninstall?: Uninstall;
  valuesFrom?: ValuesReference[];
  values?: Record<string, any>;
  postRenderers?: PostRenderer[];
}

export interface HelmReleaseStatus extends FluxCDKubeObjectStatus {
  observedPostRenderersDigest?: string;
  lastAppliedRevision?: string;
  lastAttemptedRevision?: string;
  lastAttemptedValuesChecksum?: string;
  lastReleaseRevision?: string;
  helmChart?: string;
  failures?: number;
  installFailures?: number;
  upgradeFailures?: number;
  storageNamespace?: string;
  history?: HelmReleaseSnapshot[];
  lastAttemptedGeneration?: number;
  lastAttemptedConfigDigest?: string;
  lastAttemptedReleaseAction?: string;
  lastHandledForceAt?: string;
  lastHandledResetAt?: string;
}

export class HelmRelease extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  HelmReleaseStatus,
  HelmReleaseSpec
> {
  declare kind: "HelmRelease";
  declare apiVersion: "helm.toolkit.fluxcd.io/v2";

  static readonly kind = "HelmRelease";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/helm.toolkit.fluxcd.io/v2/helmreleases";

  static readonly crd: FluxCDKubeObjectCRD = {
    apiVersions: ["helm.toolkit.fluxcd.io/v2"],
    plural: "helmreleases",
    singular: "helmrelease",
    shortNames: ["hr"],
    title: "Helm Releases",
  };

  static getAppVersion(object: HelmRelease): string | undefined {
    return object.status?.history?.[0]?.appVersion;
  }

  static getChartVersion(object: HelmRelease): string | undefined {
    return object.status?.history?.[0]?.chartVersion ?? object.spec.chart?.spec.version;
  }

  /** The kind of the object that `spec.chart` generates, `HelmChart` when the template names none. */
  static getChartTemplateKind(object: HelmRelease): HelmChartTemplateKind | undefined {
    if (!object.spec.chart) return;
    return object.spec.chart.kind ?? "HelmChart";
  }

  /**
   * The object that `spec.chart` generates. Once the controller has created it, it is the one of `status.helmChart`:
   * `<namespace>/<name>` for a `HelmChart` and `<kind>/<namespace>/<name>` for another kind. Before, it is the one
   * that `GetHelmChartTemplateReference` of helm-controller gives: `<namespace>-<name>` of the HelmRelease, in the
   * namespace of the HelmRelease, or of the `sourceRef` of a `HelmChart` template.
   */
  static getChartTemplateRef(object: HelmRelease): HelmChartReference | undefined {
    const kind = HelmRelease.getChartTemplateKind(object);
    if (!kind) return;

    const parts = object.status?.helmChart?.split("/") ?? [];
    if (parts.length === 2 && kind === "HelmChart") return { kind, namespace: parts[0], name: parts[1] };
    if (parts.length === 3 && parts[0] === kind) return { kind, namespace: parts[1], name: parts[2] };

    const namespace = object.metadata.namespace ?? "";
    return {
      kind,
      name: `${namespace}-${object.metadata.name}`,
      namespace: (kind === "HelmChart" && object.spec.chart?.spec.sourceRef?.namespace) || namespace,
    };
  }

  static getHelmReleaseUrl(object: HelmRelease, namespace: string): string {
    return `/helm/releases/${object.spec.storageNamespace ?? namespace}/${HelmRelease.getReleaseNameShortened(object)}`;
  }

  static getReleaseName(object: HelmRelease): string {
    if (object.spec.releaseName !== undefined) {
      return object.spec.releaseName;
    }
    if (object.spec.targetNamespace !== undefined) {
      return `${object.spec.targetNamespace}-${object.metadata.name}`;
    }
    return object.metadata.name;
  }

  static getReleaseNameShortened(object: HelmRelease): string {
    const name = HelmRelease.getReleaseName(object);
    if (name.length > 53) {
      const hash = Renderer.Util.sha256Hex(name).slice(0, 12);
      return `${name.slice(0, 40)}-${hash}`;
    }
    return name;
  }

  /**
   * The source of the chart: `spec.chartRef`, the `sourceRef` of a `HelmChart` template, or the `OCIRepository` that
   * an `OCIRepository` template generates, which has no `sourceRef`.
   */
  static getSourceRef(object: HelmRelease): NamespacedObjectKindReference | undefined {
    if (!object.spec.chart) return object.spec.chartRef;
    if (HelmRelease.getChartTemplateKind(object) === "OCIRepository") return HelmRelease.getChartTemplateRef(object);
    return object.spec.chart.spec.sourceRef;
  }

  static getSourceRefUrl(object: HelmRelease): string | undefined {
    const ref = HelmRelease.getSourceRef(object);
    if (!ref) return;
    return getRefUrl(ref, object);
  }

  static getSourceRefName(object: HelmRelease): string | undefined {
    return HelmRelease.getSourceRef(object)?.name;
  }

  static getSourceRefText(object: HelmRelease): string {
    const ref = HelmRelease.getSourceRef(object);
    if (!ref) return "-";
    return [ref.kind, ": ", ref.namespace ? `${ref.namespace}/` : "", ref.name].join("");
  }
}

export class HelmReleaseApi extends Renderer.K8sApi.KubeApi<HelmRelease> {}
export class HelmReleaseStore extends Renderer.K8sApi.KubeObjectStore<HelmRelease> {}
