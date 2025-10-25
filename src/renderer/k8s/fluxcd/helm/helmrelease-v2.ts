import crypto from "node:crypto";
import { Renderer } from "@freelensapp/extensions";
import {
  type FluxCDKubeObjectCRD,
  type FluxCDKubeObjectSpecWithSuspend,
  type FluxCDKubeObjectStatus,
  Image,
  JSON6902Patch,
  NamespacedObjectKindReference,
  NamespacedObjectReference,
} from "../types";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { Patch, Selector } from "../../core/types";

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

export interface HelmChartTemplateVerification {
  provider?: string;
  secretRef?: LocalObjectReference;
}

export interface HelmChartTemplateSpec {
  chart: string;
  version?: string;
  sourceRef: NamespacedObjectKindReference;
  interval?: string;
  reconcileStrategy?: string;
  valuesFiles?: string[];
  valuesFile?: string;
  verify?: HelmChartTemplateVerification;
}

export interface HelmChartTemplate {
  metadata: HelmChartTemplateObjectMeta;
  spec: HelmChartTemplateSpec;
}

export interface SecretKeyReference {
  name: string;
  key?: string;
}

export interface KubeConfigReference {
  configMapRef?: LocalObjectReference;
  secretRef?: SecretKeyReference;
}

export interface IgnoreRule {
  paths?: string[];
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

export interface HelmReleaseSpec extends FluxCDKubeObjectSpecWithSuspend {
  chart?: HelmChartTemplate;
  chartRef?: NamespacedObjectKindReference;
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

  static getChartRefNamespace(object: HelmRelease): string {
    return object.spec.chart?.spec.sourceRef.namespace ?? object.spec.chartRef?.namespace ?? object.getNs()!;
  }

  static getHelmChartName(object: HelmRelease): string {
    const ns = HelmRelease.getChartRefNamespace(object);
    return `${ns}-${object.metadata.name}`;
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
      const hash = crypto.createHash("sha256").update(name).digest("hex").slice(0, 12);
      return `${name.slice(0, 40)}-${hash}`;
    }
    return name;
  }

  static getSourceRefUrl(object: HelmRelease): string | undefined {
    const ref = object.spec.chart?.spec.sourceRef ?? object.spec.chartRef;
    if (!ref) return;
    return Renderer.K8sApi.apiManager.lookupApiLink(ref, object);
  }

  static getSourceRefName(object: HelmRelease): string | undefined {
    return object.spec.chart?.spec.sourceRef.name ?? object.spec.chartRef?.name;
  }

  static getSourceRefText(object: HelmRelease): string {
    return [
      object.spec.chart?.spec.sourceRef.kind ?? object.spec.chartRef?.kind,
      ": ",
      (object.spec.chart?.spec.sourceRef.namespace ?? object.spec.chartRef?.namespace)
        ? `${object.spec.chart?.spec.sourceRef.namespace ?? object.spec.chartRef?.namespace}/`
        : "",
      HelmRelease.getSourceRefName(object) ?? "-",
    ].join("");
  }
}

export class HelmReleaseApi extends Renderer.K8sApi.KubeApi<HelmRelease> {}
export class HelmReleaseStore extends Renderer.K8sApi.KubeObjectStore<HelmRelease> {}
