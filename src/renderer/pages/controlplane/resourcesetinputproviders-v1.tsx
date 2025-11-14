import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import {
  ResourceSetInputProvider,
  type ResourceSetInputProviderApi,
} from "../../k8s/fluxcd/controlplane/resourcesetinputprovider-v1";
import styles from "./resourcesetinputproviders.module.scss";
import stylesInline from "./resourcesetinputproviders.module.scss?inline";

const {
  Component: { Badge, BadgeBoolean, KubeObjectAge, KubeObjectListLayout, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = ResourceSetInputProvider;
type KubeObject = ResourceSetInputProvider;
type KubeObjectApi = ResourceSetInputProviderApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  type: (object: KubeObject) => object.spec?.type,
  url: (object: KubeObject) => object.spec?.url,
  enabled: (object: KubeObject) =>
    String((object.metadata.annotations?.["fluxcd.controlplane.io/reconcile"] ?? "enabled") === "enabled"),
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  status: (object: KubeObject) => getConditionText(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Type", sortBy: "type", className: styles.type },
  { title: "URL", sortBy: "url", className: styles.url },
  { title: "Enabled", sortBy: "enabled", className: styles.enabled },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Status", sortBy: "status", className: styles.status },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface ResourceSetInputProvidersPageProps {
  extension: Renderer.LensExtension;
}

export const ResourceSetInputProvidersPage = observer((props: ResourceSetInputProvidersPageProps) =>
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
            <WithTooltip>{object.spec?.type}</WithTooltip>,
            <WithTooltip>{object.spec?.url}</WithTooltip>,
            <BadgeBoolean
              value={(object.metadata.annotations?.["fluxcd.controlplane.io/reconcile"] ?? "enabled") === "enabled"}
            />,
            <Badge
              className={getConditionClass(object.status?.conditions)}
              label={getConditionText(object.status?.conditions)}
            />,
            <WithTooltip>{getStatusMessage(object.status?.conditions)}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
