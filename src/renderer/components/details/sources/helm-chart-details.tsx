import { Common, Renderer } from "@freelensapp/extensions";
import React from "react";
import { HelmChart } from "../../../k8s/fluxcd/source/helmchart";
import { getConditionClass, getConditionText } from "../../../utils";

const {
  Util: { lowerAndPluralize },
} = Common;

const {
  Component: { DrawerItem, Badge },
} = Renderer;

interface HelmChartDetailsState {
  crds: Renderer.K8sApi.CustomResourceDefinition[];
}

export class FluxCDHelmChartDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<HelmChart>,
  HelmChartDetailsState
> {
  public readonly state: Readonly<HelmChartDetailsState> = {
    crds: [],
  };

  getCrd(kind?: string): Renderer.K8sApi.CustomResourceDefinition | undefined {
    const { crds } = this.state;

    if (!kind || !crds) return;

    return crds.find((crd) => crd.spec.names.kind === kind);
  }

  sourceUrl(resource: HelmChart): string {
    const name = resource.spec.sourceRef.name;
    const ns = resource.spec.sourceRef.namespace ?? resource.metadata.namespace;
    const kind = lowerAndPluralize(resource.spec.sourceRef.kind);
    const crd = this.getCrd(resource.spec.sourceRef.kind);
    const apiVersion = crd?.spec.versions?.find((v: any) => v.storage === true)?.name;
    const group = crd?.spec.group;

    if (!apiVersion || !group) return "";

    return `/apis/${group}/${apiVersion}/namespaces/${ns}/${kind}/${name}`;
  }

  async componentDidMount() {
    const crdStore = Renderer.K8sApi.crdStore;
    if (crdStore) {
      crdStore.loadAll().then((l) => this.setState({ crds: l! }));
    }
  }

  render() {
    const { object } = this.props;

    return (
      <div>
        <DrawerItem name="Status">{object.status?.conditions?.find((s: any) => s.type === "Ready").message}</DrawerItem>
        <DrawerItem name="Ready">
          <Badge className={getConditionClass(object)} label={getConditionText(object)} />
        </DrawerItem>
        <DrawerItem name="Chart">{object.spec.chart}</DrawerItem>
        <DrawerItem name="Version">{object.spec.version}</DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        <DrawerItem name="Reconcile Strategy">{object.spec.reconcileStrategy}</DrawerItem>
        <DrawerItem name="Suspended">{object.spec.suspend === true ? "Yes" : "No"}</DrawerItem>
        <DrawerItem name="Source">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              Renderer.Navigation.showDetails(this.sourceUrl(object), true);
            }}
          >
            {object.spec.sourceRef.kind}:{object.spec.sourceRef.name}
          </a>
        </DrawerItem>
      </div>
    );
  }
}
