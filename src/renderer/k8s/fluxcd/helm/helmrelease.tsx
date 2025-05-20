import { Renderer } from "@freelensapp/extensions";

const KubeObject = Renderer.K8sApi.KubeObject;
const KubeObjectStore = Renderer.K8sApi.KubeObjectStore;

export class HelmRelease extends KubeObject<
  any,
  {
    observedGeneration?: number;
    observedPostRenderersDigest?: string;
    conditions?: {
      type?: string;
      status: string;
      observedGeneration?: number;
      lastTransitionTime: string;
      reason: string;
      message: string;
    };
    lastAppliedRevision?: string;
    lastAttemptedRevision?: string;
    lastAttemptedValuesChecksum?: string;
    lastReleaseRevision?: string;
    helmChart?: string;
    failures?: number;
    installFailures?: number;
    upgradeFailures?: number;
    storageNamespace?: string;
    history?: {
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
      lastAttemptedGeneration?: number;
      lastAttemptedConfigDigest?: string;
      lastAttemptedReleaseAction?: string;
      lastHandledForceAt?: string;
      lastHandledResetAt?: string;
    }[];
  },
  {
    chart?: {
      metadata?: {
        labels?: {
          [key: string]: string;
        };
        annotations?: {
          [key: string]: string;
        };
      };
      spec: {
        chart: string;
        version?: string;
        sourceRef: {
          apiVersion?: string;
          kind: string;
          name: string;
          namespace?: string;
        };
        interval?: string;
        reconcileStrategy?: string;
        valuesFiles?: string[];
        valuesFile?: string;
        verify?: {
          provider?: string;
          secretRef?: {
            name: string;
          };
        };
      };
    };
    chartRef?: {
      apiVersion?: string;
      kind: string;
      name: string;
      namespace?: string;
    };
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
    dependsOn?: {
      name: string;
      namespace?: string;
    }[];
    timeout?: string;
    maxHistory?: number;
    serviceAccountName?: string;
    persistentClient?: boolean;
    driftDetection?: {
      mode?: string;
      ignore?: {
        paths?: string[];
        target?: {
          group?: string;
          version?: string;
          kind?: string;
          namespace?: string;
          name?: string;
          annotationSelector?: string;
          labelSelector?: string;
        };
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
        patches?: {
          patch: string;
          target: {
            group?: string;
            version?: string;
            kind?: string;
            namespace?: string;
            name?: string;
            annotationSelector?: string;
            labelSelector?: string;
          };
        }[];
        patchesStrategicMerge?: string[];
        patchesJson6902?: {
          patch: string;
          target: {
            group?: string;
            version?: string;
            kind?: string;
            namespace?: string;
            name?: string;
            annotationSelector?: string;
            labelSelector?: string;
          };
        }[];
        images?: {
          name: string;
          newName?: string;
          newTag?: string;
          digest?: string;
        }[];
      };
    }[];
  }
> {
  static readonly kind = "HelmRelease";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/helm.toolkit.fluxcd.io/v2beta1/helmreleases";
}

export class HelmReleaseApi extends Renderer.K8sApi.KubeApi<HelmRelease> {}
export const helmReleaseApi = new HelmReleaseApi({ objectConstructor: HelmRelease });
export class HelmReleaseStore extends KubeObjectStore<HelmRelease> {
  api: Renderer.K8sApi.KubeApi<HelmRelease> = helmReleaseApi;
}
export const helmReleaseStore = new HelmReleaseStore();

Renderer.K8sApi.apiManager.registerStore(helmReleaseStore);
