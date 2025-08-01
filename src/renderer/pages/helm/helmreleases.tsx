import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { withErrorPage } from "../../components/error-page";
import { HelmRelease } from "../../k8s/fluxcd/helm/helmrelease";
import { getStatusClass, getStatusMessage, getStatusText } from "../../utils";
import styles from "./helmreleases.module.scss";
import stylesInline from "./helmreleases.module.scss?inline";

const {
  Component: { Badge, KubeObjectListLayout, KubeObjectAge, WithTooltip },
  K8sApi: { namespacesApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

export interface HelmReleasesPageProps {
  extension: Renderer.LensExtension;
}

export const HelmReleasesPage = observer((props: HelmReleasesPageProps) =>
  withErrorPage(props, () => {
    const store = HelmRelease.getStore();
    if (!store) return <></>;

    const sortingCallbacks = {
      name: (helmRelease: HelmRelease) => helmRelease.getName(),
      namespace: (helmRelease: HelmRelease) => helmRelease.getNs(),
      ready: (helmRelease: HelmRelease) => getStatusText(helmRelease),
      chartVersion: (helmRelease: HelmRelease) =>
        helmRelease.status?.history?.[0]?.chartVersion ?? helmRelease.spec.chart?.spec.version,
      appVersion: (helmRelease: HelmRelease) => helmRelease.status?.history?.[0]?.appVersion,
      status: (helmRelease: HelmRelease) => getStatusMessage(helmRelease),
      age: (helmRelease: HelmRelease) => helmRelease.getCreationTimestamp(),
    };

    const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
      { title: "Name", sortBy: "name" },
      { title: "Namespace", sortBy: "namespace" },
      { title: "Ready", sortBy: "ready", className: styles.ready },
      { title: "Chart Version", sortBy: "chartVersion" },
      { title: "App Version", sortBy: "appVersion" },
      { title: "Status", sortBy: "status" },
      { title: "Age", sortBy: "age", className: styles.age },
    ];

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout
          tableId="helmReleasesTable"
          className={styles.helmReleases}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(helmRelease: HelmRelease) => helmRelease.getSearchFields()]}
          renderHeaderTitle="Helm Releases"
          renderTableHeader={renderTableHeader}
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
  }),
);
