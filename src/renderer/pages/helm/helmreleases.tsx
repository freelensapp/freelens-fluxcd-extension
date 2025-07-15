import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { HelmRelease } from "../../k8s/fluxcd/helm/helmrelease";
import { getStatusClass, getStatusMessage, getStatusText } from "../../utils";
import styleInline from "./helmreleases.scss?inline";

const {
  Component: { Badge, KubeObjectListLayout, KubeObjectAge, WithTooltip },
  K8sApi: { namespacesApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

export const HelmReleasesPage = observer(() => {
  const store = HelmRelease.getStore();
  if (!store) return <></>;

  return (
    <>
      <style>{styleInline}</style>
      <KubeObjectListLayout
        tableId="helmReleasesTable"
        className="HelmReleases"
        store={store}
        sortingCallbacks={{
          name: (helmRelease: HelmRelease) => helmRelease.getName(),
          namespace: (helmRelease: HelmRelease) => helmRelease.getNs(),
          ready: (helmRelease: HelmRelease) => getStatusText(helmRelease),
          chartVersion: (helmRelease: HelmRelease) =>
            helmRelease.status?.history?.[0]?.chartVersion ?? helmRelease.spec.chart?.spec.version,
          appVersion: (helmRelease: HelmRelease) => helmRelease.status?.history?.[0]?.appVersion,
          status: (helmRelease: HelmRelease) => getStatusMessage(helmRelease),
          age: (helmRelease: HelmRelease) => helmRelease.getCreationTimestamp(),
        }}
        searchFilters={[(helmRelease: HelmRelease) => helmRelease.getSearchFields()]}
        renderHeaderTitle="Helm Releases"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: "name" },
          { title: "Namespace", className: "namespace", sortBy: "namespace" },
          { title: "Ready", className: "ready", sortBy: "ready" },
          { title: "Chart Version", className: "chartVersion", sortBy: "chartVersion" },
          { title: "App Version", className: "appVersion", sortBy: "appVersion" },
          { title: "Status", className: "status", sortBy: "status" },
          { title: "Age", className: "age", sortBy: "age" },
        ]}
        renderTableContents={(helmRelease: HelmRelease) => {
          const status = getStatusMessage(helmRelease);
          const chartVersion = helmRelease.status?.history?.[0]?.chartVersion ?? helmRelease.spec.chart?.spec.version;
          const appVersion = helmRelease.status?.history?.[0]?.appVersion;

          return [
            <WithTooltip>{helmRelease.getName()}</WithTooltip>,
            <Link
              key="link"
              to={getDetailsUrl(namespacesApi.formatUrlForNotListing({ name: helmRelease.getNs() }))}
              onClick={stopPropagation}
            >
              <WithTooltip>{helmRelease.getNs()}</WithTooltip>
            </Link>,
            <Badge key="name" label={getStatusText(helmRelease)} className={getStatusClass(helmRelease)} />,
            <WithTooltip>{chartVersion}</WithTooltip>,
            <WithTooltip>{appVersion}</WithTooltip>,
            <WithTooltip>{status}</WithTooltip>,
            <KubeObjectAge object={helmRelease} key="age" />,
          ];
        }}
      />
    </>
  );
});
