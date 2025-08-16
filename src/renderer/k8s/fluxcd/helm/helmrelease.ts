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

export interface HelmReleaseSpec extends FluxCDKubeObjectSpecWithSuspend {
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
  static readonly apiBase = "/apis/helm.toolkit.fluxcd.io/v2beta1/helmreleases";

  static readonly crd: FluxCDKubeObjectCRD = {
    apiVersions: ["helm.toolkit.fluxcd.io/v2beta1", "helm.toolkit.fluxcd.io/v2beta2", "helm.toolkit.fluxcd.io/v2"],
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

  static getChartRefNamespace(object: HelmRelease) {
    return object.spec.chart?.spec.sourceRef.namespace ?? object.spec.chartRef?.namespace ?? object.getNs()!;
  }

  static getHelmChartName(object: HelmRelease) {
    const ns = HelmRelease.getChartRefNamespace(object);
    return `${ns}-${object.metadata.name}`;
  }

  static getHelmReleaseUrl(object: HelmRelease, namespace: string) {
    return `/helm/releases/${object.spec.storageNamespace ?? namespace}/${HelmRelease.getReleaseNameShortened(object)}`;
  }

  static getReleaseName(object: HelmRelease) {
    if (object.spec.releaseName !== undefined) {
      return object.spec.releaseName;
    }
    if (object.spec.targetNamespace !== undefined) {
      return `${object.spec.targetNamespace}-${object.metadata.name}`;
    }
    return object.metadata.name;
  }

  static getReleaseNameShortened(object: HelmRelease) {
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
