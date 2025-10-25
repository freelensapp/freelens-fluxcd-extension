import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import { HelmRepository, type HelmRepositoryApi } from "../../k8s/fluxcd/source/helmrepository-v1";
import styles from "./helmrepositories.module.scss";
import stylesInline from "./helmrepositories.module.scss?inline";

const {
  Component: { Badge, BadgeBoolean, KubeObjectAge, KubeObjectListLayout, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = HelmRepository;
type KubeObject = HelmRepository;
type KubeObjectApi = HelmRepositoryApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  url: (object: KubeObject) => object.spec.url,
  resumed: (object: KubeObject) => String(!object.spec.suspend),
  condition: (object: KubeObject) =>
    object.spec.type == "oci" ? "Ready" : getConditionText(object.status?.conditions),
  status: (object: KubeObject) => getStatusMessage(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "URL", sortBy: "url", className: styles.url },
  { title: "Resumed", sortBy: "resumed", className: styles.resumed },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Status", sortBy: "status", className: styles.status },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface HelmRepositoriesPageProps {
  extension: Renderer.LensExtension;
}

export const HelmRepositoriesPage = observer((props: HelmRepositoriesPageProps) =>
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
          renderTableContents={(object: KubeObject) => [
            <WithTooltip>{object.getName()}</WithTooltip>,
            <NamespaceSelectBadge key="namespace" namespace={object.getNs() ?? ""} />,
            <WithTooltip>{object.spec.url}</WithTooltip>,
            <BadgeBoolean value={!object.spec.suspend} />,
            <Badge
              className={object.spec.type == "oci" ? "success" : getConditionClass(object.status?.conditions)}
              label={object.spec.type == "oci" ? "Ready" : getConditionText(object.status?.conditions)}
            />,
            <WithTooltip>{getStatusMessage(object.status?.conditions)}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
