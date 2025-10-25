import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import { ImagePolicy, type ImagePolicyApi } from "../../k8s/fluxcd/image/imagepolicy-v1beta2";
import styles from "./imagepolicies.module.scss";
import stylesInline from "./imagepolicies.module.scss?inline";

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
  latestTag: (object: KubeObject) => object.status?.latestImage?.split(":")[1],
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  status: (object: KubeObject) => getConditionText(object.status?.conditions),
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

export const ImagePoliciesPage = observer((props: ImagePoliciesPageProps) =>
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
            <WithTooltip>{object.spec.imageRepositoryRef.name}</WithTooltip>,
            <WithTooltip>{object.status?.latestImage?.split(":")[1]}</WithTooltip>,
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
