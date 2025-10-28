import { Renderer } from "@freelensapp/extensions";

import type { Condition } from "@freelensapp/kube-object";

export interface FluxDistributionStatus {
  entitlement: string;
  status: string;
  version?: string;
  managedBy?: string;
}

export interface ClusterInfo {
  serverVersion: string;
  platform: string;
  nodes?: number;
}

export interface OperatorInfo {
  apiVersion: string;
  version: string;
  platform: string;
}

export interface FluxComponentStatus {
  name: string;
  ready: boolean;
  status: string;
  image: string;
}

export interface FluxReconcilerStats {
  running: number;
  failing: number;
  suspended: number;
  totalSize?: string;
}

export interface FluxReconcilerStatus {
  apiVersion: string;
  kind: string;
  stats?: FluxReconcilerStats;
}

export interface FluxSyncStatus {
  id: string;
  path?: string;
  ready: boolean;
  status: string;
  source?: string;
}

export interface FluxReportSpec {
  distribution: FluxDistributionStatus;
  cluster?: ClusterInfo;
  operator?: OperatorInfo;
  components?: FluxComponentStatus[];
  reconcilers?: FluxReconcilerStatus[];
  sync?: FluxSyncStatus;
}

export interface FluxReportStatus {
  // ReconcileRequestStatus:
  lastHandledReconcileAt?: string;
  // FluxReportStatus:
  conditions?: Condition[];
}

export class FluxReport extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  FluxReportStatus,
  FluxReportSpec
> {
  static readonly kind = "FluxReport";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/fluxcd.controlplane.io/v1/fluxreports";

  static readonly crd = {
    apiVersions: ["fluxcd.controlplane.io/v1"],
    plural: "fluxreports",
    singular: "fluxreport",
    shortNames: [],
    title: "Flux Reports",
  };
}

export class FluxReportApi extends Renderer.K8sApi.KubeApi<FluxReport> {}
export class FluxReportStore extends Renderer.K8sApi.KubeObjectStore<FluxReport> {}
