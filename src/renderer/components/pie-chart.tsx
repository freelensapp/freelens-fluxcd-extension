import { Renderer } from "@freelensapp/extensions";
import { ArtifactGenerator } from "../k8s/fluxcd/source/artifactgenerator-v1beta1";
import styles from "./pie-chart.module.scss";

import type React from "react";

import type { HelmRepository } from "../k8s/fluxcd/source/helmrepository-v1";
import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../k8s/fluxcd/types";

type StatsObject = Renderer.K8sApi.LensExtensionKubeObject<
  any,
  FluxCDKubeObjectStatus,
  FluxCDKubeObjectSpecWithSuspend
>;

const READY = 0;
const NOT_READY = 1;
const IN_PROGRESS = 2;
const SUSPENDED = 3;
const UNKNOWN = 4;

/**
 * The category of an object, in the order of the chart. Each object has
 * exactly one: suspension wins over the status, and an OCI HelmRepository,
 * which has no status to reconcile, is ready. An object can have no spec,
 * as an ExternalArtifact, whose spec has optional fields only. An
 * ArtifactGenerator has no `spec.suspend` and is suspended by its annotation.
 */
const getCategory = (o: StatsObject) => {
  if (o.spec?.suspend === true) return SUSPENDED;
  if (o.kind === ArtifactGenerator.kind && ArtifactGenerator.isReconcileDisabled(o)) return SUSPENDED;
  if (o.kind === "HelmRepository" && (o as HelmRepository).spec.type === "oci") return READY;
  if (!o.status?.conditions) return UNKNOWN;

  const ready = o.status.conditions.find((c) => c.type === "Ready")?.status;
  if (ready === "True") return READY;
  if (ready === "False") return NOT_READY;
  return IN_PROGRESS;
};

/**
 * Counts of ready, not ready, in progress, suspended and unknown objects, in
 * this order. The categories are disjoint and add up to the number of objects.
 */
export const getStats = (objects: StatsObject[]) => {
  const stats: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const o of objects) {
    stats[getCategory(o)]++;
  }

  return stats;
};

/**
 * The id of the cluster page of the kind, which is its singular name.
 */
const getPageId = (crd: Renderer.K8sApi.CustomResourceDefinition) => {
  return crd.spec.names.singular;
};

export interface PieChartProps<A extends Renderer.K8sApi.KubeObject> {
  extension: Renderer.LensExtension;
  objects: A[];
  title: string;
  crd: Renderer.K8sApi.CustomResourceDefinition;
}

export function PieChart(
  props: PieChartProps<
    Renderer.K8sApi.LensExtensionKubeObject<any, FluxCDKubeObjectStatus, FluxCDKubeObjectSpecWithSuspend>
  >,
): React.ReactElement {
  const { extension, objects, title, crd } = props;
  const [ready, notReady, inProgress, suspended, unknown] = getStats(objects);

  const chartData: Renderer.Component.PieChartData = {
    datasets: [
      {
        data: [ready, notReady, inProgress, suspended, unknown],
        backgroundColor: ["#43a047", "#ce3933", "#FF6600", "#3d90ce", "#3a3a3c"],
        tooltipLabels: [
          (percent) => `Ready: ${percent}`,
          (percent) => `Not Ready: ${percent}`,
          (percent) => `In progress: ${percent}`,
          (percent) => `Suspended: ${percent}`,
          (percent) => `Unknown: ${percent}`,
        ],
      },
    ],

    labels: [
      `Ready: ${ready}`,
      `Not Ready: ${notReady}`,
      `In progress: ${inProgress}`,
      `Suspended: ${suspended}`,
      `Unknown: ${unknown}`,
    ],
  };

  return (
    <>
      <div className={styles.title}>
        <a
          onClick={(e) => {
            e.preventDefault();
            void extension.navigate(getPageId(crd));
          }}
        >
          {title} ({objects.length})
        </a>
      </div>
      <Renderer.Component.PieChart data={chartData} />
    </>
  );
}
