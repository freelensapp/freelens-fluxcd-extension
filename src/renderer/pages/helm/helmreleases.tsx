import { Renderer } from "@freelensapp/extensions";

import { observer } from "mobx-react";

import React from "react";

import { KubeAge } from "../../components/ui/kube-age";
import { HelmRelease, helmReleaseStore } from "../../k8s/fluxcd/helm/helmrelease";
import { getStatusClass, getStatusMessage, getStatusText } from "../../utils";

const {
  Component: { KubeObjectListLayout, Badge },
} = Renderer;

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
        renderTableContents={(helmRelease: HelmRelease) => [
          helmRelease.getName(),
          helmRelease.getNs(),
          this.renderStatus(helmRelease),
          helmRelease.status?.history?.[0]?.chartVersion ?? helmRelease.spec.chart?.spec.version,
          helmRelease.status?.history?.[0]?.appVersion,
          getStatusMessage(helmRelease),
          <KubeAge timestamp={helmRelease.getCreationTimestamp()} key="age" />,
        ]}
      />
    );
  }

  renderStatus(helmRelease: HelmRelease) {
    const className = getStatusClass(helmRelease);
    const text = getStatusText(helmRelease);
    return <Badge key="name" label={text} className={className} />;
  }
}
