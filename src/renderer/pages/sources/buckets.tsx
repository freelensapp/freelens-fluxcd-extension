import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionMessage, getConditionText } from "../../components/status-conditions";
import { Bucket, type BucketApi } from "../../k8s/fluxcd/source/bucket";
import styles from "./buckets.module.scss";
import stylesInline from "./buckets.module.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = Bucket;
type KubeObject = Bucket;
type KubeObjectApi = BucketApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  provider: (object: KubeObject) => object.spec.provider,
  bucket: (object: KubeObject) => object.spec.bucketName,
  condition: (object: KubeObject) => getConditionText(object),
  message: (object: KubeObject) => getConditionText(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Provider", sortBy: "provider", className: styles.provider },
  { title: "Bucket", sortBy: "bucket", className: styles.bucket },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Message", sortBy: "message", className: styles.message },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface BucketsPageProps {
  extension: Renderer.LensExtension;
}

export const BucketsPage = observer((props: BucketsPageProps) =>
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
            <WithTooltip>{object.spec.provider ?? "generic"}</WithTooltip>,
            <WithTooltip>{object.spec.bucketName}</WithTooltip>,
            <Badge className={getConditionClass(object)} label={getConditionText(object)} />,
            <WithTooltip>{getConditionMessage(object)}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
