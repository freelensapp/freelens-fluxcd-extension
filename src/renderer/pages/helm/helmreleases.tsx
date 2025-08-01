import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { withErrorPage } from "../../components/error-page";
import { HelmRelease, type HelmReleaseApi } from "../../k8s/fluxcd/helm/helmrelease";
import { getConditionClass, getConditionMessage, getConditionText } from "../../utils";
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

const KubeObject = HelmRelease;
type KubeObject = HelmRelease;
type KubeObjectApi = HelmReleaseApi;

function getAppVersion(object: KubeObject): string | undefined {
  return object.status?.history?.[0]?.appVersion;
}

function getChartVersion(object: KubeObject): string | undefined {
  return object.status?.history?.[0]?.chartVersion ?? object.spec.chart?.spec.version;
}

export interface HelmReleasesPageProps {
  extension: Renderer.LensExtension;
}

export const HelmReleasesPage = observer((props: HelmReleasesPageProps) =>
  withErrorPage(props, () => {
    const store = KubeObject.getStore<KubeObject>();

    const sortingCallbacks = {
      name: (object: KubeObject) => object.getName(),
      namespace: (object: KubeObject) => object.getNs(),
      ready: (object: KubeObject) => getConditionText(object),
      chartVersion: (object: KubeObject) => getChartVersion(object),
      appVersion: (object: KubeObject) => getAppVersion(object),
      condition: (object: KubeObject) => getConditionMessage(object),
      age: (object: KubeObject) => object.getCreationTimestamp(),
    };

    const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
      { title: "Name", sortBy: "name" },
      { title: "Namespace", sortBy: "namespace" },
      { title: "Ready", sortBy: "ready", className: styles.ready },
      { title: "Chart Version", sortBy: "chartVersion" },
      { title: "App Version", sortBy: "appVersion" },
      { title: "Condition", sortBy: "condition" },
      { title: "Age", sortBy: "age", className: styles.age },
    ];

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle="Helm Releases"
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => {
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <Link
                key="link"
                to={getDetailsUrl(namespacesApi.formatUrlForNotListing({ name: object.getNs() }))}
                onClick={stopPropagation}
              >
                <WithTooltip>{object.getNs()}</WithTooltip>
              </Link>,
              <Badge key="name" label={getConditionText(object)} className={getConditionClass(object)} />,
              <WithTooltip>{getChartVersion(object)}</WithTooltip>,
              <WithTooltip>{getAppVersion(object)}</WithTooltip>,
              <WithTooltip>{getConditionMessage(object)}</WithTooltip>,
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
