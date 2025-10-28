import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import { FluxInstance, type FluxInstanceApi } from "../../k8s/fluxcd/controlplane/fluxinstance-v1";
import styles from "./fluxinstances.module.scss";
import stylesInline from "./fluxinstances.module.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = FluxInstance;
type KubeObject = FluxInstance;
type KubeObjectApi = FluxInstanceApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  revision: (object: KubeObject) => object.status?.lastAttemptedRevision,
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  status: (object: KubeObject) => getStatusMessage(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Revision", sortBy: "revision", className: styles.revision },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Status", sortBy: "status", className: styles.status },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface FluxInstancesPageProps {
  extension: Renderer.LensExtension;
}

export const FluxInstancesPage = observer((props: FluxInstancesPageProps) =>
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
            <WithTooltip>{object.status?.lastAttemptedRevision || "N/A"}</WithTooltip>,
            <Badge
              label={getConditionText(object.status?.conditions)}
              className={getConditionClass(object.status?.conditions)}
            />,
            <WithTooltip>{getStatusMessage(object.status?.conditions)}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
