import { Renderer } from "@freelensapp/extensions";
import styles from "./pie-chart.module.scss";
import stylesInline from "./pie-chart.module.scss?inline";

import type React from "react";

import type { HelmRepository } from "../k8s/fluxcd/source/helmrepository-v1";
import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatus } from "../k8s/fluxcd/types";

const getStats = (
  objects: Renderer.K8sApi.LensExtensionKubeObject<any, FluxCDKubeObjectStatus, FluxCDKubeObjectSpecWithSuspend>[],
) => {
  const suspended = objects.filter((o) => o.spec.suspend === true).length;
  const ready = objects.filter(
    (o) =>
      !o.spec.suspend &&
      ((o.kind === "HelmRepository" && (o as HelmRepository).spec.type === "oci") ||
        o.status?.conditions?.find((c) => c.type === "Ready")?.status === "True"),
  ).length;
  const notReady = objects.filter(
    (o) => !o.spec.suspend && o.status?.conditions?.find((c) => c.type === "Ready")?.status === "False",
  ).length;
  const unknown = objects.filter(
    (o) => (o.kind !== "HelmRepository" || (o as HelmRepository).spec.type !== "oci") && !o.status?.conditions,
  ).length;
  const inProgress = objects.length - ready - notReady - suspended - unknown;

  return [ready, notReady, inProgress, suspended, unknown];
};

const getPath = (crd: Renderer.K8sApi.CustomResourceDefinition) => {
  return crd.spec.names.plural;
};

export interface PieChartProps<A extends Renderer.K8sApi.KubeObject> {
  objects: A[];
  title: string;
  crd: Renderer.K8sApi.CustomResourceDefinition;
}

export function PieChart(
  props: PieChartProps<
    Renderer.K8sApi.LensExtensionKubeObject<any, FluxCDKubeObjectStatus, FluxCDKubeObjectSpecWithSuspend>
  >,
): React.ReactElement {
  const { objects, title, crd } = props;
  const [ready, notReady, inProgress, suspended, unknown] = getStats(objects);

  const chartData: Renderer.Component.PieChartData = {
    datasets: [
      {
        data: [ready, notReady, inProgress, suspended, unknown],
        backgroundColor: ["#43a047", "#ce3933", "#FF6600", "#3d90ce", "#3a3a3c"],
        tooltipLabels: [
          (percent) => `Ready: ${percent}`,
          (percent) => `Not Ready: ${percent}`,
          (percent) => `In pogress: ${percent}`,
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
      <style>{stylesInline}</style>
      <>
        <div className={styles.title}>
          <a
            onClick={(e) => {
              e.preventDefault();
              Renderer.Navigation.navigate({ pathname: getPath(crd) });
            }}
          >
            {title} ({objects.length})
          </a>
        </div>
        <Renderer.Component.PieChart data={chartData} />
      </>
    </>
  );
}
