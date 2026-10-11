import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import {
  getConditionClass,
  getConditionText,
  getLastUpdated,
  getStatusMessage,
} from "../../components/status-conditions";
import { FluxReport, type FluxReportApi } from "../../k8s/fluxcd/controlplane/fluxreport-v1";
import { fluxOperatorReconcileAnnotation } from "../../k8s/fluxcd/controlplane/types";
import { isReconcileDisabled } from "../../k8s/fluxcd/utils";
import styles from "./fluxreports.module.scss";

const { observer } = MobxReact;

const {
  Component: {
    Badge,
    BadgeBoolean,
    KubeObjectAge,
    KubeObjectListLayout,
    NamespaceSelectBadge,
    ReactiveDuration,
    WithTooltip,
  },
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
  enabled: (object: KubeObject) => String(!isReconcileDisabled(object, fluxOperatorReconcileAnnotation)),
  condition: (object: KubeObject) =>
    getConditionText(object.status?.conditions, isReconcileDisabled(object, fluxOperatorReconcileAnnotation)),
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
  { title: "Enabled", sortBy: "enabled", className: styles.enabled },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Last Updated", sortBy: "lastUpdated", className: styles.lastUpdated },
  { title: "Status", sortBy: "status", className: styles.status },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface FluxReportsPageProps {
  extension: Renderer.LensExtension;
}

export const FluxReportsPage = observer((props: FluxReportsPageProps) => {
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
          <BadgeBoolean value={!isReconcileDisabled(object, fluxOperatorReconcileAnnotation)} />,
          <Badge
            label={getConditionText(
              object.status?.conditions,
              isReconcileDisabled(object, fluxOperatorReconcileAnnotation),
            )}
            className={getConditionClass(
              object.status?.conditions,
              isReconcileDisabled(object, fluxOperatorReconcileAnnotation),
            )}
          />,
          <ReactiveDuration timestamp={getLastUpdated(object.status?.conditions)} />,
          <WithTooltip>{getStatusMessage(object.status?.conditions)}</WithTooltip>,
          <KubeObjectAge object={object} key="age" />,
        ]}
      />
    </>
  );
});
