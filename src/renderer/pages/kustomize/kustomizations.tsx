import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { withErrorPage } from "../../components/error-page";
import { Kustomization, type KustomizationApi } from "../../k8s/fluxcd/kustomize/kustomization";
import { getConditionClass, getConditionMessage, getConditionText } from "../../utils";
import styles from "./kustomizations.module.scss";
import stylesInline from "./kustomizations.module.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, WithTooltip },
  K8sApi: { namespacesApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

const KubeObject = Kustomization;
type KubeObject = Kustomization;
type KubeObjectApi = KustomizationApi;

function getLastAppliedRevision(object: KubeObject): string | undefined {
  return object.status?.lastAppliedRevision?.replace(/^refs\/(heads|tags)\//, "");
}

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  revision: (object: KubeObject) => object.status?.lastAppliedRevision,
  condition: (object: KubeObject) => getConditionText(object),
  message: (object: KubeObject) => getConditionText(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
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
            <Link
              key="link"
              to={getDetailsUrl(namespacesApi.formatUrlForNotListing({ name: object.getNs() }))}
              onClick={stopPropagation}
            >
              <WithTooltip>{object.getNs()}</WithTooltip>
            </Link>,
            <WithTooltip>{getLastAppliedRevision(object) ?? "N/A"}</WithTooltip>,
            <Badge className={getConditionClass(object)} label={getConditionText(object)} />,
            <WithTooltip>{getConditionMessage(object)}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
