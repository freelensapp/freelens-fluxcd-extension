import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import { HelmChart, type HelmChartApi } from "../../k8s/fluxcd/source/helmchart-v1beta1";
import { getRefUrl } from "../../k8s/fluxcd/utils";
import { getMaybeDetailsUrl } from "../../utils";
import styles from "./helmcharts.module.scss";
import stylesInline from "./helmcharts.module.scss?inline";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, BadgeBoolean, KubeObjectAge, KubeObjectListLayout, MaybeLink, NamespaceSelectBadge, WithTooltip },
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
  resumed: (object: KubeObject) => String(!object.spec.suspend),
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  status: (object: KubeObject) => getConditionText(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Chart", sortBy: "chart", className: styles.chart },
  { title: "Version", sortBy: "version", className: styles.version },
  { title: "Source Kind", sortBy: "sourceKind", className: styles.sourceKind },
  { title: "Source Name", sortBy: "sourceName", className: styles.sourceName },
  { title: "Resumed", sortBy: "resumed", className: styles.resumed },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Status", sortBy: "status", className: styles.status },
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
            <BadgeBoolean value={!object.spec.suspend} />,
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
