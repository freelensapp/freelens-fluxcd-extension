import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { crdStore } from "../../../k8s/core/crd";
import { HelmRelease } from "../../../k8s/fluxcd/helm/helmrelease";
import { lowerAndPluralize } from "../../../utils";

const {
  Component: { DrawerItem },
} = Renderer;

interface HelmReleaseDetailsState {
  crds: Renderer.K8sApi.CustomResourceDefinition[];
}

export class FluxCDHelmReleaseDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<HelmRelease>,
  HelmReleaseDetailsState
> {
  public readonly state: Readonly<HelmReleaseDetailsState> = {
    crds: [],
  };

  getCrd(kind?: string): Renderer.K8sApi.CustomResourceDefinition | null {
    const { crds } = this.state;

    if (!kind) {
      return null;
    }

    if (!crds) {
      return null;
    }

    return crds.find((crd) => crd.spec.names.kind === kind) ?? null;
  }

  sourceUrl(resource: HelmRelease): string {
    const name = resource.spec.chart?.spec.sourceRef.name ?? resource.spec.chartRef?.name;
    const ns =
      resource.spec.chart?.spec.sourceRef.namespace ?? resource.spec.chartRef?.namespace ?? resource.metadata.namespace;
    const kind = lowerAndPluralize(resource.spec.chart?.spec.sourceRef.kind ?? resource.spec.chartRef?.kind ?? "");
    const crd = this.getCrd(resource.spec.chart?.spec.sourceRef.kind ?? resource.spec.chartRef?.kind);
    const apiVersion = crd?.spec.versions?.find((v: any) => v.storage === true)?.name;
    const group = crd?.spec.group;

    if (!apiVersion || !group) return "";

    return `/apis/${group}/${apiVersion}/namespaces/${ns}/${kind}/${name}`;
  }

  async componentDidMount() {
    crdStore.loadAll().then((l) => this.setState({ crds: l as Renderer.K8sApi.CustomResourceDefinition[] }));
  }

  render() {
    const { object } = this.props;

    return (
      <div>
        {/* Link to Artifact hub! */}
        <DrawerItem name="Helm Chart">{object.spec.chart?.spec.chart ?? object.spec.chartRef?.name}</DrawerItem>
        <DrawerItem name="Version">{object.spec.chart?.spec.version}</DrawerItem>
        <DrawerItem name="Chart Interval">{object.spec.chart?.spec.interval}</DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        <DrawerItem name="Source">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              Renderer.Navigation.showDetails(this.sourceUrl(object), true);
            }}
          >
            {object.spec.chart?.spec.sourceRef.kind ?? object.spec.chartRef?.kind}:
            {object.spec.chart?.spec.sourceRef.name ?? object.spec.chartRef?.name}
          </a>
        </DrawerItem>
      </div>
    );
  }
}
