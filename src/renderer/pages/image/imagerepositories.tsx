import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionMessage, getConditionText } from "../../components/status-conditions";
import { ImageRepository, type ImageRepositoryApi } from "../../k8s/fluxcd/image/imagerepository";
import styles from "./imagerepositories.module.scss";
import stylesInline from "./imagerepositories.module.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = ImageRepository;
type KubeObject = ImageRepository;
type KubeObjectApi = ImageRepositoryApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  image: (object: KubeObject) => object.spec.image,
  tags: (object: KubeObject) => object.status?.lastScanResult?.tagCount,
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  message: (object: KubeObject) => getConditionText(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Image", sortBy: "image", className: styles.image },
  { title: "Tags", sortBy: "tags", className: styles.tags },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Message", sortBy: "message", className: styles.message },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface ImageRepositoriesPageProps {
  extension: Renderer.LensExtension;
}

export const ImageRepositoriesPage = observer((props: ImageRepositoriesPageProps) =>
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
            <WithTooltip>{object.spec.image}</WithTooltip>,
            <WithTooltip>{object.status?.lastScanResult?.tagCount}</WithTooltip>,
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
