import { Common, Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import { ExternalArtifact, type ExternalArtifactApi } from "../../k8s/fluxcd/source/externalartifact-v1";
import { getMaybeDetailsUrl } from "../../utils";
import styles from "./externalartifacts.module.scss";

const { observer } = MobxReact;

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, MaybeLink, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = ExternalArtifact;
type KubeObject = ExternalArtifact;
type KubeObjectApi = ExternalArtifactApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  source: (object: KubeObject) => object.spec?.sourceRef?.name,
  revision: (object: KubeObject) => object.status?.artifact?.revision,
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  status: (object: KubeObject) => getStatusMessage(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Source", sortBy: "source", className: styles.source },
  { title: "Revision", sortBy: "revision", className: styles.revision },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Status", sortBy: "status", className: styles.status },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface ExternalArtifactsPageProps {
  extension: Renderer.LensExtension;
}

export const ExternalArtifactsPage = observer((props: ExternalArtifactsPageProps) => {
  const store = KubeObject.getStore<KubeObject>();

  return (
    <>
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
            <MaybeLink key="link" to={getMaybeDetailsUrl(KubeObject.getSourceRefUrl(object))} onClick={stopPropagation}>
              {object.spec?.sourceRef?.name}
            </MaybeLink>
          </WithTooltip>,
          <WithTooltip>{object.status?.artifact?.revision ?? "N/A"}</WithTooltip>,
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
});
