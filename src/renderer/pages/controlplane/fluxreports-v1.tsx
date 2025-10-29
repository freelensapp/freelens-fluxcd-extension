import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import {
  getConditionClass,
  getConditionText,
  getLastUpdated,
  getStatusMessage,
} from "../../components/status-conditions";
import { FluxReport, type FluxReportApi } from "../../k8s/fluxcd/controlplane/fluxreport-v1";
import styles from "./fluxreports.module.scss";
import stylesInline from "./fluxreports.module.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, NamespaceSelectBadge, ReactiveDuration, WithTooltip },
} = Renderer;

const KubeObject = FluxReport;
type KubeObject = FluxReport;
type KubeObjectApi = FluxReportApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  version: (object: KubeObject) => object.spec.distribution.version,
  failing: (object: KubeObject) =>
    object.spec.reconcilers?.map((r) => r.stats?.failing || 0).reduce((a, b) => a + b, 0) ?? 0,
  running: (object: KubeObject) =>
    object.spec.reconcilers?.map((r) => r.stats?.running || 0).reduce((a, b) => a + b, 0) ?? 0,
  suspended: (object: KubeObject) =>
    object.spec.reconcilers?.map((r) => r.stats?.suspended || 0).reduce((a, b) => a + b, 0) ?? 0,
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  lastUpdated: (object: KubeObject) => getLastUpdated(object.status?.conditions),
  status: (object: KubeObject) => getStatusMessage(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Version", sortBy: "version", className: styles.version },
  { title: "Failing", sortBy: "failing", className: styles.failing },
  { title: "Running", sortBy: "running", className: styles.running },
  { title: "Suspended", sortBy: "suspended", className: styles.suspended },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Last Updated", sortBy: "lastUpdated", className: styles.lastUpdated },
  { title: "Status", sortBy: "status", className: styles.status },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface FluxReportsPageProps {
  extension: Renderer.LensExtension;
}

export const FluxReportsPage = observer((props: FluxReportsPageProps) =>
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
            <WithTooltip>{object.spec.distribution.version || "N/A"}</WithTooltip>,
            <WithTooltip>
              {object.spec.reconcilers?.map((r) => r.stats?.failing || 0).reduce((a, b) => a + b, 0) ?? "N/A"}
            </WithTooltip>,
            <WithTooltip>
              {object.spec.reconcilers?.map((r) => r.stats?.running || 0).reduce((a, b) => a + b, 0) ?? "N/A"}
            </WithTooltip>,
            <WithTooltip>
              {object.spec.reconcilers?.map((r) => r.stats?.suspended || 0).reduce((a, b) => a + b, 0) ?? "N/A"}
            </WithTooltip>,
            <Badge
              label={getConditionText(object.status?.conditions)}
              className={getConditionClass(object.status?.conditions)}
            />,
            <ReactiveDuration timestamp={getLastUpdated(object.status?.conditions)} />,
            <WithTooltip>{getStatusMessage(object.status?.conditions)}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
