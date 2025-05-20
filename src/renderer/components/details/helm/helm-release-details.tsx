import { Common, Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import React from "react";
import { Link } from "react-router-dom";
import { crdStore } from "../../../k8s/core/crd";
import { HelmRelease } from "../../../k8s/fluxcd/helm/helmrelease";
import { lowerAndPluralize } from "../../../utils";

const {
  Component: { DrawerItem, DrawerTitle, MonacoEditor },
  K8sApi: { serviceAccountsApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

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
    const namespace =
      resource.spec.chart?.spec.sourceRef.namespace ?? resource.spec.chartRef?.namespace ?? resource.metadata.namespace;
    const kind = lowerAndPluralize(resource.spec.chart?.spec.sourceRef.kind ?? resource.spec.chartRef?.kind ?? "");
    const crd = this.getCrd(resource.spec.chart?.spec.sourceRef.kind ?? resource.spec.chartRef?.kind);
    const apiVersion = crd?.spec.versions?.find((v: any) => v.storage === true)?.name;
    const group = crd?.spec.group;

    if (!apiVersion || !group) return "";

    return `/apis/${group}/${apiVersion}/namespaces/${namespace}/${kind}/${name}`;
  }

  async componentDidMount() {
    crdStore.loadAll().then((l) => this.setState({ crds: l as Renderer.K8sApi.CustomResourceDefinition[] }));
  }

  render() {
    const { object } = this.props;
    const valuesYaml = yaml.dump(object.spec.values);

    const namespace =
      object.spec.chart?.spec.sourceRef.namespace ?? object.spec.chartRef?.namespace ?? object.metadata.namespace;

    const serviceAccountDetailsUrl =
      object.spec.serviceAccountName &&
      getDetailsUrl(
        serviceAccountsApi.formatUrlForNotListing({
          name: object.spec.serviceAccountName,
          namespace,
        }),
      );

    return (
      <div>
        {/* Link to Artifact hub! */}
        <DrawerItem name="Helm Chart">{object.spec.chart?.spec.chart ?? object.spec.chartRef?.name}</DrawerItem>
        <DrawerItem name="Chart Version">
          {object.status?.history?.[0]?.chartVersion ?? object.spec.chart?.spec.version ?? "-"}
        </DrawerItem>
        <DrawerItem name="App Version">{object.status?.history?.[0]?.appVersion ?? "-"}</DrawerItem>
        {object.status?.history?.[0]?.status && (
          <DrawerItem name="Status">{object.status?.history?.[0]?.status}</DrawerItem>
        )}
        {object.spec.chart?.spec.interval && (
          <DrawerItem name="Chart Interval">{object.spec.chart?.spec.interval}</DrawerItem>
        )}
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        {object.spec.maxHistory && <DrawerItem name="Max History">{object.spec.maxHistory}</DrawerItem>}
        {object.spec.timeout && <DrawerItem name="Timeout">{object.spec.timeout}</DrawerItem>}
        {object.spec.releaseName && <DrawerItem name="Release Name">{object.spec.releaseName}</DrawerItem>}
        {object.spec.serviceAccountName && (
          <DrawerItem name="Service Account">
            {serviceAccountDetailsUrl ? (
              <Link key="link" to={serviceAccountDetailsUrl} onClick={stopPropagation}>
                {object.spec.serviceAccountName}
              </Link>
            ) : (
              object.spec.serviceAccountName
            )}
          </DrawerItem>
        )}
        {object.spec.storageNamespace && (
          <DrawerItem name="Storage Namespace">{object.spec.storageNamespace}</DrawerItem>
        )}
        {object.spec.targetNamespace && <DrawerItem name="Target Namespace">{object.spec.targetNamespace}</DrawerItem>}
        {object.spec.driftDetection?.mode && (
          <DrawerItem name="Drift Detection">{object.spec.driftDetection?.mode}</DrawerItem>
        )}
        {object.spec.install?.crds && <DrawerItem name="Install CRDs">{object.spec.install?.crds}</DrawerItem>}
        {object.spec.upgrade?.crds && <DrawerItem name="Upgrade CRDs">{object.spec.upgrade?.crds}</DrawerItem>}
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
        <DrawerItem name="Last Transition Message">{object.status?.conditions?.[0].message && "-"}</DrawerItem>
        {object.spec.values && (
          <div className="values">
            <DrawerTitle>Values</DrawerTitle>
            <div className="flex column gaps">
              <MonacoEditor readOnly id="values" style={{ minHeight: 300 }} value={valuesYaml} />
            </div>
          </div>
        )}
      </div>
    );
  }
}
