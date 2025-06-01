import { Common, Renderer } from "@freelensapp/extensions";

import { observer } from "mobx-react";

import React from "react";

import { KubeAge } from "../../components/ui/kube-age";
import { HelmRelease, helmReleaseStore } from "../../k8s/fluxcd/helm/helmrelease";
import { getStatusClass, getStatusMessage, getStatusText } from "../../utils";

import { Link } from "react-router-dom";
import styleInline from "./helmreleases.scss?inline";

const {
  Component: { KubeObjectListLayout, Badge, Tooltip },
  K8sApi: { namespacesApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

enum sortBy {
  name = "name",
  namespace = "namespace",
  status = "status",
  ready = "ready",
  age = "age",
  chartVersion = "chartVersion",
  appVersion = "appVersion",
}

@observer
export class FluxCDHelmReleases extends React.Component<{ extension: Renderer.LensExtension }> {
  render() {
    return (
      <>
        <style>{styleInline}</style>
        <KubeObjectListLayout
          tableId="helmReleasesTable"
          className="HelmReleases"
          store={helmReleaseStore}
          sortingCallbacks={{
            // show revision like weave
            [sortBy.name]: (helmRelease: HelmRelease) => helmRelease.getName(),
            [sortBy.namespace]: (helmRelease: HelmRelease) => helmRelease.getNs(),
            [sortBy.ready]: (helmRelease: HelmRelease) => getStatusText(helmRelease),
            [sortBy.chartVersion]: (helmRelease: HelmRelease) =>
              helmRelease.status?.history?.[0]?.chartVersion ?? helmRelease.spec.chart?.spec.version,
            [sortBy.appVersion]: (helmRelease: HelmRelease) => helmRelease.status?.history?.[0]?.appVersion,
            [sortBy.status]: (helmRelease: HelmRelease) => getStatusMessage(helmRelease),
            [sortBy.age]: (helmRelease: HelmRelease) => helmRelease.getCreationTimestamp(),
          }}
          searchFilters={[(helmRelease: HelmRelease) => helmRelease.getSearchFields()]}
          renderHeaderTitle="Helm Releases"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: sortBy.name },
            { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
            { title: "Ready", className: "ready", sortBy: sortBy.ready },
            { title: "Chart Version", className: "chartVersion", sortBy: sortBy.chartVersion },
            { title: "App Version", className: "appVersion", sortBy: sortBy.appVersion },
            { title: "Status", className: "status", sortBy: sortBy.status },
            { title: "Age", className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(helmRelease: HelmRelease) => {
            const tooltipId = `helmRelease-${helmRelease.getId()}`;
            const status = getStatusMessage(helmRelease);
            const chartVersion = helmRelease.status?.history?.[0]?.chartVersion ?? helmRelease.spec.chart?.spec.version;
            const appVersion = helmRelease.status?.history?.[0]?.appVersion;

            return [
              helmRelease.getName(),
              <>
                <span id={`${tooltipId}-namespace`}>
                  <Link
                    key="link"
                    to={getDetailsUrl(namespacesApi.formatUrlForNotListing({ name: helmRelease.getNs() }))}
                    onClick={stopPropagation}
                  >
                    {helmRelease.getNs()}
                  </Link>
                </span>
                <Tooltip targetId={`${tooltipId}-namespace`}>{helmRelease.getNs()}</Tooltip>
              </>,
              this.renderStatus(helmRelease),
              <>
                <span id={`${tooltipId}-chartVersion`}>{chartVersion}</span>
                <Tooltip targetId={`${tooltipId}-chartVersion`}>{chartVersion}</Tooltip>
              </>,
              <>
                <span id={`${tooltipId}-appVersion`}>{appVersion}</span>
                <Tooltip targetId={`${tooltipId}-appVersion`}>{appVersion}</Tooltip>
              </>,
              <>
                <span id={`${tooltipId}-status`}>{status}</span>
                <Tooltip targetId={`${tooltipId}-status`}>{status}</Tooltip>
              </>,
              <KubeAge timestamp={helmRelease.getCreationTimestamp()} key="age" />,
            ];
          }}
        />
      </>
    );
  }

  renderStatus(helmRelease: HelmRelease) {
    const className = getStatusClass(helmRelease);
    const text = getStatusText(helmRelease);
    return <Badge key="name" label={text} className={className} />;
  }
}
