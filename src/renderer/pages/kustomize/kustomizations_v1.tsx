import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import { Kustomization_v1, type KustomizationApi_v1 } from "../../k8s/fluxcd/kustomize/kustomization_v1";
import { getMaybeDetailsUrl } from "../../utils";
import styles from "./kustomizations.module.scss";
import stylesInline from "./kustomizations.module.scss?inline";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, BadgeBoolean, KubeObjectAge, KubeObjectListLayout, MaybeLink, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = Kustomization_v1;
type KubeObject = Kustomization_v1;
type KubeObjectApi = KustomizationApi_v1;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  source: (object: KubeObject) => object.spec.sourceRef.name,
  revision: (object: KubeObject) => object.status?.lastAppliedRevision,
  resumed: (object: KubeObject) => String(!object.spec.suspend),
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  status: (object: KubeObject) => getConditionText(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Source", sortBy: "source", className: styles.source },
  { title: "Revision", sortBy: "revision", className: styles.revision },
  { title: "Resumed", sortBy: "resumed", className: styles.resumed },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Status", sortBy: "status", className: styles.status },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface KustomizationsPageProps {
  extension: Renderer.LensExtension;
}

export const KustomizationsPage_v1 = observer((props: KustomizationsPageProps) =>
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
            <WithTooltip tooltip={KubeObject.getSourceRefText(object)}>
              <MaybeLink
                key="link"
                to={getMaybeDetailsUrl(KubeObject.getSourceRefUrl(object))}
                onClick={stopPropagation}
              >
                {object.spec.sourceRef.name}
              </MaybeLink>
            </WithTooltip>,
            <WithTooltip>{KubeObject.getLastAppliedRevision(object) ?? "N/A"}</WithTooltip>,
            <BadgeBoolean value={!object.spec.suspend} />,
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
