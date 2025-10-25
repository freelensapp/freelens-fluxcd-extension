import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import { HelmRelease, type HelmReleaseApi } from "../../k8s/fluxcd/helm/helmrelease-v2beta2";
import { getMaybeDetailsUrl } from "../../utils";
import styles from "./helmreleases.module.scss";
import stylesInline from "./helmreleases.module.scss?inline";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, BadgeBoolean, KubeObjectListLayout, KubeObjectAge, MaybeLink, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = HelmRelease;
type KubeObject = HelmRelease;
type KubeObjectApi = HelmReleaseApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  source: (object: KubeObject) => KubeObject.getSourceRefName(object),
  chartVersion: (object: KubeObject) => KubeObject.getChartVersion(object),
  appVersion: (object: KubeObject) => KubeObject.getAppVersion(object),
  resumed: (object: KubeObject) => String(!object.spec.suspend),
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  status: (object: KubeObject) => getStatusMessage(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Source", sortBy: "source", className: styles.source },
  { title: "Chart Version", sortBy: "chartVersion" },
  { title: "App Version", sortBy: "appVersion" },
  { title: "Resumed", sortBy: "resumed", className: styles.resumed },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Status", sortBy: "status", className: styles.status },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface HelmReleasesPageProps {
  extension: Renderer.LensExtension;
}

export const HelmReleasesPage = observer((props: HelmReleasesPageProps) =>
  withErrorPage(props, () => {
    const store = KubeObject.getStore<KubeObject>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => {
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <NamespaceSelectBadge key="namespace" namespace={object.getNs() ?? ""} />,
              <WithTooltip tooltip={KubeObject.getSourceRefText(object)}>
                <MaybeLink to={getMaybeDetailsUrl(KubeObject.getSourceRefUrl(object))} onClick={stopPropagation}>
                  {KubeObject.getSourceRefName(object)}
                </MaybeLink>
              </WithTooltip>,
              <WithTooltip>{KubeObject.getChartVersion(object) ?? "N/A"}</WithTooltip>,
              <WithTooltip>{KubeObject.getAppVersion(object) ?? "N/A"}</WithTooltip>,
              <BadgeBoolean value={!object.spec.suspend} />,
              <Badge
                key="name"
                label={getConditionText(object.status?.conditions)}
                className={getConditionClass(object.status?.conditions)}
              />,
              <WithTooltip>{getStatusMessage(object.status?.conditions)}</WithTooltip>,
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
