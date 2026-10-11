import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import { ImagePolicy, type ImagePolicyApi } from "../../k8s/fluxcd/image/imagepolicy-v1";
import styles from "./imagepolicies.module.scss";

const { observer } = MobxReact;

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = ImagePolicy;
type KubeObject = ImagePolicy;
type KubeObjectApi = ImagePolicyApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  repository: (object: KubeObject) => object.spec.imageRepositoryRef.name,
  latestTag: (object: KubeObject) => KubeObject.getLatestTag(object),
  condition: (object: KubeObject) => getConditionText(object.status?.conditions, object.spec.suspend),
  status: (object: KubeObject) => getConditionText(object.status?.conditions, object.spec.suspend),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Repository", sortBy: "repository", className: styles.repository },
  { title: "Latest Tag", sortBy: "latestTag", className: styles.latestTag },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Status", sortBy: "status", className: styles.status },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface ImagePoliciesPageProps {
  extension: Renderer.LensExtension;
}

export const ImagePoliciesPage = observer((props: ImagePoliciesPageProps) => {
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
          <WithTooltip>{object.spec.imageRepositoryRef.name}</WithTooltip>,
          <WithTooltip>{KubeObject.getLatestTag(object)}</WithTooltip>,
          <Badge
            className={getConditionClass(object.status?.conditions, object.spec.suspend)}
            label={getConditionText(object.status?.conditions, object.spec.suspend)}
          />,
          <WithTooltip>{getStatusMessage(object.status?.conditions)}</WithTooltip>,
          <KubeObjectAge object={object} key="age" />,
        ]}
      />
    </>
  );
});
