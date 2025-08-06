import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionMessage, getConditionText } from "../../components/status-conditions";
import { HelmChart, type HelmChartApi } from "../../k8s/fluxcd/source/helmchart";
import { getRefUrl } from "../../k8s/fluxcd/utils";
import { getMaybeDetailsUrl } from "../../utils";
import styles from "./helmcharts.module.scss";
import stylesInline from "./helmcharts.module.scss?inline";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, MaybeLink, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = HelmChart;
type KubeObject = HelmChart;
type KubeObjectApi = HelmChartApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  chart: (object: KubeObject) => object.spec.chart,
  version: (object: KubeObject) => object.spec.version,
  sourceKind: (object: KubeObject) => object.spec.sourceRef.kind,
  sourceName: (object: KubeObject) => object.spec.sourceRef.name,
  condition: (object: KubeObject) => getConditionText(object),
  message: (object: KubeObject) => getConditionText(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Chart", sortBy: "chart", className: styles.chart },
  { title: "Version", sortBy: "version", className: styles.version },
  { title: "Source Kind", sortBy: "sourceKind", className: styles.sourceKind },
  { title: "Source Name", sortBy: "sourceName", className: styles.sourceName },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Message", sortBy: "message", className: styles.message },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface HelmChartsPageProps {
  extension: Renderer.LensExtension;
}

export const HelmChartsPage = observer((props: HelmChartsPageProps) =>
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
            <WithTooltip>{object.spec.chart}</WithTooltip>,
            <WithTooltip>{object.spec.version ?? "N/A"}</WithTooltip>,
            <WithTooltip>{object.spec.sourceRef.kind}</WithTooltip>,
            <WithTooltip>
              <MaybeLink to={getMaybeDetailsUrl(getRefUrl(object.spec.sourceRef, object))} onClick={stopPropagation}>
                {object.spec.sourceRef?.name}
              </MaybeLink>
            </WithTooltip>,
            <Badge className={getConditionClass(object)} label={getConditionText(object)} />,
            <WithTooltip>{getConditionMessage(object)}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
