import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import {
  ArtifactGenerator,
  type ArtifactGeneratorApi,
  sourceWatcherReconcileAnnotation,
} from "../../k8s/fluxcd/source/artifactgenerator-v1beta1";
import { isReconcileDisabled } from "../../k8s/fluxcd/utils";
import styles from "./artifactgenerators.module.scss";

const { observer } = MobxReact;

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = ArtifactGenerator;
type KubeObject = ArtifactGenerator;
type KubeObjectApi = ArtifactGeneratorApi;

const getSourceNames = (object: KubeObject) => object.spec?.sources?.map((source) => source.name).join(", ");

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  sources: (object: KubeObject) => getSourceNames(object),
  artifacts: (object: KubeObject) => object.spec?.artifacts?.length ?? 0,
  condition: (object: KubeObject) =>
    getConditionText(object.status?.conditions, isReconcileDisabled(object, sourceWatcherReconcileAnnotation)),
  status: (object: KubeObject) => getStatusMessage(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Sources", sortBy: "sources", className: styles.sources },
  { title: "Artifacts", sortBy: "artifacts", className: styles.artifacts },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Status", sortBy: "status", className: styles.status },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface ArtifactGeneratorsPageProps {
  extension: Renderer.LensExtension;
}

export const ArtifactGeneratorsPage = observer((props: ArtifactGeneratorsPageProps) =>
  withErrorPage(props, () => {
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
            <WithTooltip tooltip={object.spec?.sources?.map(KubeObject.getSourceRefText).join(", ")}>
              {getSourceNames(object)}
            </WithTooltip>,
            <WithTooltip>{object.spec?.artifacts?.length ?? 0}</WithTooltip>,
            <Badge
              className={getConditionClass(
                object.status?.conditions,
                isReconcileDisabled(object, sourceWatcherReconcileAnnotation),
              )}
              label={getConditionText(
                object.status?.conditions,
                isReconcileDisabled(object, sourceWatcherReconcileAnnotation),
              )}
            />,
            <WithTooltip>{getStatusMessage(object.status?.conditions)}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
