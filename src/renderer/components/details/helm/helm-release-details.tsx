import crypto from "crypto";
import { Common, Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import React from "react";
import { Link } from "react-router-dom";
import { crdStore } from "../../../k8s/core/crd";
import { HelmRelease } from "../../../k8s/fluxcd/helm/helmrelease";
import { lowerAndPluralize } from "../../../utils";

const {
  Component: { DrawerItem, DrawerTitle, Icon, MonacoEditor },
  K8sApi: { configMapApi, namespacesApi, secretsApi, serviceAccountsApi },
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
    const namespace = this.getNamespace(resource);
    const kind = lowerAndPluralize(resource.spec.chart?.spec.sourceRef.kind ?? resource.spec.chartRef?.kind ?? "");
    const crd = this.getCrd(resource.spec.chart?.spec.sourceRef.kind ?? resource.spec.chartRef?.kind);
    const apiVersion = crd?.spec.versions?.find((v: any) => v.storage === true)?.name;
    const group = crd?.spec.group;

    if (!apiVersion || !group) return "";

    return `/apis/${group}/${apiVersion}/namespaces/${namespace}/${kind}/${name}`;
  }

  helmChartUrl(resource: HelmRelease): string | undefined {
    if (!resource.spec.chart) return;

    const name = resource.metadata.name;
    const namespace = this.getNamespace(resource);
    const kind = lowerAndPluralize("HelmChart");
    const crd = this.getCrd(resource.spec.chart?.spec.sourceRef.kind ?? resource.spec.chartRef?.kind);
    const apiVersion = crd?.spec.versions?.find((v: any) => v.storage === true)?.name;
    const group = crd?.spec.group;

    if (!apiVersion || !group) return;

    return `/apis/${group}/${apiVersion}/namespaces/${namespace}/${kind}/${namespace}-${name}`;
  }

  async componentDidMount() {
    crdStore.loadAll().then((l) => this.setState({ crds: l as Renderer.K8sApi.CustomResourceDefinition[] }));
  }

  getNamespace(resource: HelmRelease) {
    return (
      resource.spec.chart?.spec.sourceRef.namespace ?? resource.spec.chartRef?.namespace ?? resource.metadata.namespace!
    );
  }

  getHelmChartName(resource: HelmRelease) {
    const namespace = this.getNamespace(resource);

    return `${namespace}-${resource.metadata.name}`;
  }

  getReleaseName(resource: HelmRelease) {
    if (resource.spec.releaseName !== undefined) {
      return resource.spec.releaseName;
    }

    if (resource.spec.targetNamespace !== undefined) {
      return `${resource.spec.targetNamespace}-${resource.metadata.name}`;
    }

    return resource.metadata.name;
  }

  getReleaseNameShortened(resource: HelmRelease) {
    const name = this.getReleaseName(resource);

    if (name.length > 53) {
      const hash = crypto.createHash("sha256").update(name).digest("hex").slice(0, 12);
      return `${name.slice(0, 40)}-${hash}`;
    }

    return name;
  }

  render() {
    const { object } = this.props;
    const valuesYaml = yaml.dump(object.spec.values);

    const namespace = this.getNamespace(object);
    const releaseName = this.getReleaseNameShortened(object);

    return (
      <div>
        <DrawerItem name="Release Name">
          <Link
            key="link"
            to={`/helm/releases/${object.spec.storageNamespace ?? namespace}/${releaseName}`}
            onClick={stopPropagation}
          >
            {releaseName}
          </Link>
        </DrawerItem>
        <DrawerItem name="Helm Chart" hidden={!object.spec.chart}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              Renderer.Navigation.showDetails(this.helmChartUrl(object), true);
            }}
          >
            {this.getHelmChartName(object)}
          </a>
        </DrawerItem>
        <DrawerItem name="Chart Name">
          {object.status?.history?.[0]?.chartName ?? object.spec.chart?.spec.chart}
        </DrawerItem>
        <DrawerItem name="Chart Version">
          {object.status?.history?.[0]?.chartVersion ?? object.spec.chart?.spec.version}
        </DrawerItem>
        <DrawerItem name="App Version">{object.status?.history?.[0]?.appVersion}</DrawerItem>
        <DrawerItem name="Status" hidden={!object.status?.history?.[0]?.status}>
          {object.status?.history?.[0]?.status}
        </DrawerItem>
        <DrawerItem name="Chart Interval" hidden={!object.spec.chart?.spec.interval}>
          {object.spec.chart?.spec.interval}
        </DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        <DrawerItem name="Max History" hidden={!object.spec.maxHistory}>
          {object.spec.maxHistory}
        </DrawerItem>
        <DrawerItem name="Timeout" hidden={!object.spec.timeout}>
          {object.spec.timeout}
        </DrawerItem>
        <DrawerItem name="Service Account" hidden={!object.spec.serviceAccountName}>
          <Link
            key="link"
            to={getDetailsUrl(
              serviceAccountsApi.formatUrlForNotListing({ name: object.spec.serviceAccountName, namespace }),
            )}
            onClick={stopPropagation}
          >
            {object.spec.serviceAccountName}
          </Link>
        </DrawerItem>
        <DrawerItem name="Storage Namespace" hidden={!object.spec.storageNamespace}>
          <Link
            key="link"
            to={getDetailsUrl(namespacesApi.formatUrlForNotListing({ name: object.spec.storageNamespace }))}
            onClick={stopPropagation}
          >
            {object.spec.storageNamespace}
          </Link>
        </DrawerItem>
        <DrawerItem name="Target Namespace" hidden={!object.spec.targetNamespace}>
          <Link
            key="link"
            to={getDetailsUrl(namespacesApi.formatUrlForNotListing({ name: object.spec.targetNamespace }))}
            onClick={stopPropagation}
          >
            {object.spec.targetNamespace}
          </Link>
        </DrawerItem>
        <DrawerItem name="Drift Detection" hidden={!object.spec.driftDetection?.mode}>
          {object.spec.driftDetection?.mode}
        </DrawerItem>
        <DrawerItem name="Install CRDs" hidden={!object.spec.install?.crds}>
          {object.spec.install?.crds}
        </DrawerItem>
        <DrawerItem name="Upgrade CRDs" hidden={!object.spec.upgrade?.crds}>
          {object.spec.upgrade?.crds}
        </DrawerItem>
        <DrawerItem name="Source">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              Renderer.Navigation.showDetails(this.sourceUrl(object), true);
            }}
          >
            {object.spec.chart?.spec.sourceRef.kind ?? object.spec.chartRef?.kind}:{" "}
            {object.spec.chart?.spec.sourceRef.name ?? object.spec.chartRef?.name}
          </a>
        </DrawerItem>
        <DrawerItem name="Last Message" hidden={!object.status?.conditions?.[0].message}>
          {object.status?.conditions?.[0].message}
        </DrawerItem>

        {object.spec.valuesFrom && (
          <div className="valuesFrom">
            <DrawerTitle>Values From</DrawerTitle>
            {object.spec.valuesFrom.map((valueFrom) => {
              const api = valueFrom.kind.toLowerCase() === "configmap" ? configMapApi : secretsApi;
              const name = valueFrom.name;
              return (
                <div key={name} className="valueFrom">
                  <div className="title flex gaps">
                    <Icon small material="list" />
                  </div>
                  <DrawerItem name="Kind">{valueFrom.kind}</DrawerItem>
                  <DrawerItem name="Name">
                    <Link
                      key="link"
                      to={getDetailsUrl(api.formatUrlForNotListing({ name, namespace }))}
                      onClick={stopPropagation}
                    >
                      {name}
                    </Link>
                  </DrawerItem>
                  <DrawerItem name="Values Key" hidden={!valueFrom.valuesKey}>
                    {valueFrom.valuesKey}
                  </DrawerItem>
                  <DrawerItem name="Target Path" hidden={!valueFrom.targetPath}>
                    {valueFrom.targetPath}
                  </DrawerItem>
                  <DrawerItem name="Optional" hidden={!valueFrom.optional}>
                    {valueFrom.optional}
                  </DrawerItem>
                </div>
              );
            })}
          </div>
        )}

        {object.spec.values && (
          <div className="values">
            <DrawerTitle>Values</DrawerTitle>
            <div className="flex column gaps">
              <MonacoEditor readOnly id="values" style={{ minHeight: 300 }} value={valuesYaml} />
            </div>
          </div>
        )}

        {object.status?.history && (
          <div className="history">
            <DrawerTitle>History</DrawerTitle>
            {object.status?.history.map((snapshot) => (
              <div className="snapshot">
                <div className="title flex gaps">
                  <Icon small material="list" />
                </div>
                <DrawerItem name="Version">{snapshot.version}</DrawerItem>
                <DrawerItem name="First Deployed">{snapshot.firstDeployed}</DrawerItem>
                <DrawerItem name="Last Deployed">{snapshot.lastDeployed}</DrawerItem>
                <DrawerItem name="Name">{snapshot.name}</DrawerItem>
                <DrawerItem name="Namespace">{snapshot.namespace}</DrawerItem>
                <DrawerItem name="Chart Name">{snapshot.chartName}</DrawerItem>
                <DrawerItem name="Chart Version">{snapshot.chartVersion}</DrawerItem>
                <DrawerItem name="App Version">{snapshot.appVersion}</DrawerItem>
                <DrawerItem name="Status">{snapshot.status}</DrawerItem>
              </div>
            ))}
          </div>
        )}

        {object.status?.conditions && (
          <div className="conditions">
            <DrawerTitle>Conditions</DrawerTitle>
            {object.status?.conditions.map((condition) => (
              <div className="condition">
                <div className="title flex gaps">
                  <Icon small material="list" />
                </div>
                <DrawerItem name="Last Transition Time">{condition.lastTransitionTime}</DrawerItem>
                <DrawerItem name="Reason">{condition.reason}</DrawerItem>
                <DrawerItem name="Status">{condition.status}</DrawerItem>
                <DrawerItem name="Type" hidden={!condition.type}>
                  {condition.type}
                </DrawerItem>
                <DrawerItem name="Message">{condition.message}</DrawerItem>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
