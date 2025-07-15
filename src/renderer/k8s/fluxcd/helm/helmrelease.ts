import { Renderer } from "@freelensapp/extensions";
import { getApi, getStore } from "../stores";
import {
  Image,
  JSON6902Patch,
  LocalObjectReference,
  NamespacedObjectKindReference,
  NamespacedObjectReference,
} from "../types";

import type { Condition, Patch, Selector } from "../../core/types";

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

export interface HelmReleaseStatus {
  observedGeneration?: number;
  observedPostRenderersDigest?: string;
  conditions?: Condition[];
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

export interface HelmReleaseSpec {
  chart?: {
    metadata?: {
      labels?: Record<string, string>;
      annotations?: Record<string, string>;
    };
    spec: {
      chart: string;
      version?: string;
      sourceRef: NamespacedObjectKindReference;
      interval?: string;
      reconcileStrategy?: string;
      valuesFiles?: string[];
      valuesFile?: string;
      verify?: {
        provider?: string;
        secretRef?: LocalObjectReference;
      };
    };
  };
  chartRef?: NamespacedObjectKindReference;
  interval: string;
  kubeConfig?: {
    secretRef: {
      name: string;
      key?: string;
    };
  };
  suspend?: boolean;
  releaseName?: string;
  targetNamespace?: string;
  storageNamespace?: string;
  dependsOn?: NamespacedObjectReference[];
  timeout?: string;
  maxHistory?: number;
  serviceAccountName?: string;
  persistentClient?: boolean;
  driftDetection?: {
    mode?: string;
    ignore?: {
      paths?: string[];
      target?: Selector;
    }[];
  };
  install?: {
    timeout?: string;
    remediation?: {
      retries?: number;
      ignoreTestFailures?: boolean;
      remediateLastFailure?: boolean;
    };
    disableWait?: boolean;
    disableWaitForJobs?: boolean;
    disableHooks?: boolean;
    disableOpenAPIValidation?: boolean;
    replace?: boolean;
    skipCRDs?: boolean;
    crds?: string;
    createNamespace?: boolean;
  };
  upgrade?: {
    timeout?: string;
    remediation?: {
      retries?: number;
      ignoreTestFailures?: boolean;
      remediateLastFailure?: boolean;
      strategy?: string;
    };
    disableWait?: boolean;
    disableWaitForJobs?: boolean;
    disableHooks?: boolean;
    disableOpenAPIValidation?: boolean;
    force?: boolean;
    preserveValues?: boolean;
    cleanupOnFail?: boolean;
    crds?: string;
  };
  test?: {
    enable?: boolean;
    timeout?: string;
    ignoreFailures?: boolean;
  };
  rollback?: {
    timeout?: string;
    disableWait?: boolean;
    disableWaitForJobs?: boolean;
    disableHooks?: boolean;
    recreate?: boolean;
    force?: boolean;
    cleanupOnFail?: boolean;
  };
  uninstall?: {
    timeout?: string;
    disableHooks?: boolean;
    keepHistory?: boolean;
    disableWait?: boolean;
    deletionPropagation?: string;
  };
  valuesFrom?: {
    kind: string;
    name: string;
    valuesKey?: string;
    targetPath?: string;
    optional?: boolean;
  }[];
  values?: {
    [key: string]: any;
  };
  postRenderers?: {
    kustomize?: {
      patches?: Patch[];
      patchesStrategicMerge?: string[];
      patchesJson6902?: JSON6902Patch[];
      images?: Image[];
    };
  }[];
}

export class HelmRelease extends Renderer.K8sApi.KubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  HelmReleaseStatus,
  HelmReleaseSpec
> {
  static readonly kind = "HelmRelease";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/helm.toolkit.fluxcd.io/v2beta1/helmreleases";

  static readonly crd = {
    apiVersions: ["helm.toolkit.fluxcd.io/v2beta1", "helm.toolkit.fluxcd.io/v2beta2", "helm.toolkit.fluxcd.io/v2"],
    plural: "helmreleases",
    singular: "helmrelease",
    shortNames: ["hr"],
    title: "Helm Releases",
  };

  static getApi = getApi;
  static getStore = getStore;
}

export class HelmReleaseApi extends Renderer.K8sApi.KubeApi<HelmRelease> {}
export class HelmReleaseStore extends Renderer.K8sApi.KubeObjectStore<HelmRelease> {}
