import crypto from "crypto";
import { Common, Renderer } from "@freelensapp/extensions";
import { Base64 } from "js-base64";
import yaml from "js-yaml";
import React from "react";
import { Link } from "react-router-dom";
import { crdStore } from "../../../k8s/core/crd";
import { HelmRelease, HelmReleaseSnapshot } from "../../../k8s/fluxcd/helm/helmrelease";
import { lowerAndPluralize } from "../../../utils";

import styleInline from "./helm-release-details.scss?inline";

const {
  Component: { DrawerItem, DrawerTitle, Icon, MonacoEditor, Table, TableCell, TableHead, TableRow, Tooltip },
  K8sApi: { configMapApi, namespacesApi, secretsApi, serviceAccountsApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

interface HelmReleaseDetailsState {
  crds: Renderer.K8sApi.CustomResourceDefinition[];
  valuesFromYaml: Record<string, string>;
}

enum historySortBy {
  version = "version",
  lastDeployed = "lastDeployed",
  chartVersion = "chartVersion",
  appVersion = "appVersion",
  status = "status",
}

export class FluxCDHelmReleaseDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<HelmRelease>,
  HelmReleaseDetailsState
> {
  public readonly state: Readonly<HelmReleaseDetailsState> = {
    crds: [],
    valuesFromYaml: {},
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

    const { object } = this.props;
    const namespace = this.getNamespace(object);

    for (const valueFrom of object.spec.valuesFrom ?? []) {
      const api = valueFrom.kind.toLowerCase() === "secret" ? secretsApi : configMapApi;
      const name = valueFrom.name;
      const valuesKey = valueFrom.valuesKey ?? "values.yaml";
      const valuesObject = await api.get({ name, namespace });
      if (!valuesObject) continue;
      const valuesYaml = valuesObject?.data?.[valuesKey];
      if (!valuesYaml) continue;
      if (valueFrom.kind.toLowerCase() === "secret" && Base64.isValid(valuesYaml)) {
        this.state.valuesFromYaml[`${namespace}/${name}/${valuesKey}`] = Base64.decode(valuesYaml);
      } else {
        this.state.valuesFromYaml[`${namespace}/${name}/${valuesKey}`] = valuesYaml;
      }
    }
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

    const namespace = this.getNamespace(object);
    const releaseName = this.getReleaseNameShortened(object);
    const valuesYaml = yaml.dump(object.spec.values);

    return (
      <>
        <style>{styleInline}</style>
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
          <DrawerItem name="First Deployed" hidden={!object.status?.history?.[0].firstDeployed}>
            {object.status?.history?.[0].firstDeployed}
          </DrawerItem>
          <DrawerItem name="Last Deployed" hidden={!object.status?.history?.[0].lastDeployed}>
            {object.status?.history?.[0].lastDeployed}
          </DrawerItem>
          <DrawerItem name="Last Message" hidden={!object.status?.conditions?.[0].message}>
            {object.status?.conditions?.[0].message}
          </DrawerItem>

          {object.spec.valuesFrom && (
            <div className="valuesFrom">
              <DrawerTitle>Values From</DrawerTitle>
              {object.spec.valuesFrom.map((valueFrom) => {
                const api = valueFrom.kind.toLowerCase() === "secret" ? secretsApi : configMapApi;
                const name = valueFrom.name;
                const valuesYaml = this.state.valuesFromYaml[`${namespace}/${name}/${valueFrom.valuesKey}`];

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
                    <div className="flex column gaps">
                      <MonacoEditor
                        readOnly
                        id={`valuesFrom-${namespace}-${name}-${valueFrom.valuesKey}`}
                        style={{ minHeight: 300 }}
                        value={valuesYaml}
                      />
                    </div>
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
            <div className="HelmReleaseHistory flex column">
              <DrawerTitle>History</DrawerTitle>
              <Table
                selectable
                tableId="history"
                scrollable={false}
                sortable={{
                  [historySortBy.version]: (snapshot: HelmReleaseSnapshot) => snapshot.version,
                  [historySortBy.lastDeployed]: (snapshot: HelmReleaseSnapshot) => snapshot.lastDeployed,
                  [historySortBy.chartVersion]: (snapshot: HelmReleaseSnapshot) => snapshot.chartVersion,
                  [historySortBy.appVersion]: (snapshot: HelmReleaseSnapshot) => snapshot.appVersion,
                  [historySortBy.status]: (snapshot: HelmReleaseSnapshot) => snapshot.status,
                }}
                sortByDefault={{ sortBy: historySortBy.version, orderBy: "desc" }}
                sortSyncWithUrl={false}
                className="box grow"
              >
                <TableHead flat sticky={false}>
                  <TableCell className="version" sortBy={historySortBy.version}>
                    Version
                  </TableCell>
                  <TableCell className="lastDeployed" sortBy={historySortBy.lastDeployed}>
                    Last Deployed
                  </TableCell>
                  <TableCell className="chartVersion" sortBy={historySortBy.chartVersion}>
                    Chart Version
                  </TableCell>
                  <TableCell className="appVersion" sortBy={historySortBy.appVersion}>
                    App Version
                  </TableCell>
                  <TableCell className="status" sortBy={historySortBy.status}>
                    Status
                  </TableCell>
                </TableHead>
                {object.status?.history.map((snapshot) => (
                  <TableRow key={snapshot.version} sortItem={snapshot} nowrap>
                    <TableCell className="version">{snapshot.version}</TableCell>
                    <TableCell className="lastDeployed">{snapshot.lastDeployed}</TableCell>
                    <TableCell className="chartVersion" id={`helmReleaseHistory-${snapshot.version}-chartVersion`}>
                      {snapshot.chartVersion}
                      <Tooltip targetId={`helmReleaseHistory-${snapshot.version}-chartVersion`}>
                        {snapshot.chartVersion}
                      </Tooltip>
                    </TableCell>
                    <TableCell className="appVersion" id={`helmReleaseHistory-${snapshot.version}-appVersion`}>
                      {snapshot.appVersion}{" "}
                      <Tooltip targetId={`helmReleaseHistory-${snapshot.version}-appVersion`}>
                        {snapshot.appVersion}
                      </Tooltip>
                    </TableCell>
                    <TableCell className="status">{snapshot.status}</TableCell>
                  </TableRow>
                ))}
              </Table>
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
      </>
    );
  }
}
