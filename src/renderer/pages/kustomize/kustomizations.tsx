import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionMessage, getConditionText } from "../../components/status-conditions";
import { Kustomization, type KustomizationApi } from "../../k8s/fluxcd/kustomize/kustomization";
import { getMaybeDetailsUrl } from "../../utils";
import styles from "./kustomizations.module.scss";
import stylesInline from "./kustomizations.module.scss?inline";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, MaybeLink, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = Kustomization;
type KubeObject = Kustomization;
type KubeObjectApi = KustomizationApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  source: (object: KubeObject) => object.spec.sourceRef.name,
  revision: (object: KubeObject) => object.status?.lastAppliedRevision,
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  message: (object: KubeObject) => getConditionText(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Source", sortBy: "source", className: styles.source },
  { title: "Revision", sortBy: "revision", className: styles.revision },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Message", sortBy: "message", className: styles.message },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface KustomizationsPageProps {
  extension: Renderer.LensExtension;
}

export const KustomizationsPage = observer((props: KustomizationsPageProps) =>
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
            <WithTooltip tooltip={Kustomization.getSourceRefText(object)}>
              <MaybeLink
                key="link"
                to={getMaybeDetailsUrl(Kustomization.getSourceRefUrl(object))}
                onClick={stopPropagation}
              >
                {object.spec.sourceRef.name}
              </MaybeLink>
            </WithTooltip>,
            <WithTooltip>{Kustomization.getLastAppliedRevision(object) ?? "N/A"}</WithTooltip>,
            <Badge
              className={getConditionClass(object.status?.conditions)}
              label={getConditionText(object.status?.conditions)}
            />,
            <WithTooltip>{getConditionMessage(object.status?.conditions)}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
