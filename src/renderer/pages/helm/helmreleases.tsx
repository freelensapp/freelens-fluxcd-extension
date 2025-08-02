import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { withErrorPage } from "../../components/error-page";
import { HelmRelease, type HelmReleaseApi } from "../../k8s/fluxcd/helm/helmrelease";
import { getConditionClass, getConditionMessage, getConditionText, getMaybeDetailsUrl } from "../../utils";
import styles from "./helmreleases.module.scss";
import stylesInline from "./helmreleases.module.scss?inline";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, KubeObjectListLayout, KubeObjectAge, MaybeLink, WithTooltip },
  K8sApi: { namespacesApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const KubeObject = HelmRelease;
type KubeObject = HelmRelease;
type KubeObjectApi = HelmReleaseApi;

export interface HelmReleasesPageProps {
  extension: Renderer.LensExtension;
}

export const HelmReleasesPage = observer((props: HelmReleasesPageProps) =>
  withErrorPage(props, () => {
    const store = KubeObject.getStore<KubeObject>();

    const sortingCallbacks = {
      name: (object: KubeObject) => object.getName(),
      namespace: (object: KubeObject) => object.getNs(),
      source: (object: KubeObject) => KubeObject.getSourceRefName(object),
      condition: (object: KubeObject) => getConditionText(object),
      chartVersion: (object: KubeObject) => HelmRelease.getChartVersion(object),
      appVersion: (object: KubeObject) => HelmRelease.getAppVersion(object),
      message: (object: KubeObject) => getConditionMessage(object),
      age: (object: KubeObject) => object.getCreationTimestamp(),
    };

    const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
      { title: "Name", sortBy: "name" },
      { title: "Namespace", sortBy: "namespace" },
      { title: "Source", sortBy: "source", className: styles.source },
      { title: "Chart Version", sortBy: "chartVersion" },
      { title: "App Version", sortBy: "appVersion" },
      { title: "Condition", sortBy: "condition", className: styles.condition },
      { title: "Message", sortBy: "message", className: styles.message },
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
          renderHeaderTitle={KubeObject.crd.title}
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
              <WithTooltip tooltip={KubeObject.getSourceRefText(object)}>
                <MaybeLink to={getMaybeDetailsUrl(KubeObject.getSourceRefUrl(object))} onClick={stopPropagation}>
                  {KubeObject.getSourceRefName(object)}
                </MaybeLink>
              </WithTooltip>,
              <WithTooltip>{KubeObject.getChartVersion(object) ?? "N/A"}</WithTooltip>,
              <WithTooltip>{KubeObject.getAppVersion(object) ?? "N/A"}</WithTooltip>,
              <Badge key="name" label={getConditionText(object)} className={getConditionClass(object)} />,
              <WithTooltip>{getConditionMessage(object)}</WithTooltip>,
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
