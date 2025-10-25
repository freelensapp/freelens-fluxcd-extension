import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import {
  ImageUpdateAutomation,
  type ImageUpdateAutomationApi,
} from "../../k8s/fluxcd/image/imageupdateautomation-v1beta2";
import styles from "./imageupdateautomations.module.scss";
import stylesInline from "./imageupdateautomations.module.scss?inline";

const {
  Component: {
    Badge,
    KubeObjectAge,
    KubeObjectListLayout,
    LocaleDate,
    NamespaceSelectBadge,
    ReactiveDuration,
    WithTooltip,
  },
} = Renderer;

const KubeObject = ImageUpdateAutomation;
type KubeObject = ImageUpdateAutomation;
type KubeObjectApi = ImageUpdateAutomationApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  lastRun: (object: KubeObject) => object.status?.lastAutomationRunTime,
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  status: (object: KubeObject) => getConditionText(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Last Run", sortBy: "lastRun", className: styles.lastRun },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Status", sortBy: "status", className: styles.status },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface ImageUpdateAutomationsPageProps {
  extension: Renderer.LensExtension;
}

export const ImageUpdateAutomationsPage = observer((props: ImageUpdateAutomationsPageProps) =>
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
            <WithTooltip
              tooltip={
                object.status?.lastAutomationRunTime ? <LocaleDate date={object.status?.lastAutomationRunTime} /> : null
              }
            >
              <ReactiveDuration timestamp={object.metadata.creationTimestamp} compact={false} />
            </WithTooltip>,
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
