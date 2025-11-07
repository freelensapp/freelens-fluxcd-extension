import { Renderer } from "@freelensapp/extensions";
import crypto from "crypto";
import { observer } from "mobx-react";
import React from "react";
import { createEnumFromKeys } from "../../../utils";
import { DurationAbsoluteTimestamp } from "../../duration-absolute";
import styles from "./flux-report-details.module.scss";
import stylesInline from "./flux-report-details.module.scss?inline";

import type { FluxReconcilerStatus, FluxReport } from "../../../k8s/fluxcd/controlplane/fluxreport-v1";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, Icon, Table, TableCell, TableHead, TableRow, WithTooltip },
} = Renderer;

const reconcilersSortable = {
  apiVersion: (reconciler: FluxReconcilerStatus) => reconciler.apiVersion,
  kind: (reconciler: FluxReconcilerStatus) => reconciler.kind,
  running: (reconciler: FluxReconcilerStatus) => reconciler.stats?.running ?? 0,
  failing: (reconciler: FluxReconcilerStatus) => reconciler.stats?.failing ?? 0,
  suspended: (reconciler: FluxReconcilerStatus) => reconciler.stats?.suspended ?? 0,
};

const ReconcilersSortableNames = createEnumFromKeys(reconcilersSortable);

const reconcilersSortByDefault: {
  sortBy: keyof typeof reconcilersSortable;
  orderBy: Renderer.Component.TableOrderBy;
} = {
  sortBy: ReconcilersSortableNames.kind,
  orderBy: "asc",
};

export const FluxReportDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<FluxReport>> = observer((props) => {
  const { object } = props;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Reconciliation Enabled">
          <BadgeBoolean
            value={(object.metadata.annotations?.["fluxcd.controlplane.io/reconcile"] ?? "enabled") === "enabled"}
          />
        </DrawerItem>
        <DrawerItem name="Reconciliation Interval">
          {object.metadata.annotations?.["fluxcd.controlplane.io/reconcileEvery"] ?? "5m"}
        </DrawerItem>
        <DrawerItem name="Last Handled Reconcile At" hidden={!object.status?.lastHandledReconcileAt}>
          <DurationAbsoluteTimestamp timestamp={object.status?.lastHandledReconcileAt} />
        </DrawerItem>

        <DrawerTitle>Distribution</DrawerTitle>
        <DrawerItem name="Entitlement">{object.spec.distribution.entitlement}</DrawerItem>
        <DrawerItem name="Status">{object.spec.distribution.status}</DrawerItem>
        <DrawerItem name="Version" hidden={!object.spec.distribution.version}>
          {object.spec.distribution.version}
        </DrawerItem>
        <DrawerItem name="Managed By" hidden={!object.spec.distribution.managedBy}>
          {object.spec.distribution.managedBy}
        </DrawerItem>

        {object.spec.cluster && (
          <>
            <DrawerTitle>Cluster Info</DrawerTitle>
            <DrawerItem name="Server Version">{object.spec.cluster.serverVersion}</DrawerItem>
            <DrawerItem name="Platform">{object.spec.cluster.platform}</DrawerItem>
            <DrawerItem name="Nodes" hidden={!object.spec.cluster.nodes}>
              {object.spec.cluster.nodes}
            </DrawerItem>
          </>
        )}

        {object.spec.operator && (
          <>
            <DrawerTitle>Operator Info</DrawerTitle>
            <DrawerItem name="API Version">{object.spec.operator.apiVersion}</DrawerItem>
            <DrawerItem name="Version">{object.spec.operator.version}</DrawerItem>
            <DrawerItem name="Platform">{object.spec.operator.platform}</DrawerItem>
          </>
        )}

        {object.spec.components && object.spec.components.length > 0 && (
          <>
            <DrawerTitle>Components</DrawerTitle>
            {object.spec.components.map((component) => {
              const key = crypto.createHash("sha256").update(JSON.stringify(component)).digest("hex").substring(0, 16);
              return (
                <div key={key}>
                  <div className={styles.title}>
                    <Icon small material="list" />
                  </div>
                  <DrawerItem name="Name">{component.name}</DrawerItem>
                  <DrawerItem name="Ready">
                    <BadgeBoolean value={component.ready} />
                  </DrawerItem>
                  <DrawerItem name="Status">{component.status}</DrawerItem>
                  <DrawerItem name="Image">{component.image}</DrawerItem>
                </div>
              );
            })}
          </>
        )}

        {object.spec.reconcilers && object.spec.reconcilers.length > 0 && (
          <div>
            <DrawerTitle>Reconcilers</DrawerTitle>
            <Table
              selectable
              tableId="reconcilers"
              scrollable={false}
              sortable={reconcilersSortable}
              sortByDefault={reconcilersSortByDefault}
              sortSyncWithUrl={false}
              className="box grow"
            >
              <TableHead flat sticky={false}>
                <TableCell className="kind" sortBy="kind">
                  Kind
                </TableCell>
                <TableCell className="running" sortBy="running">
                  Running
                </TableCell>
                <TableCell className="failing" sortBy="failing">
                  Failing
                </TableCell>
                <TableCell className="suspended" sortBy="suspended">
                  Suspended
                </TableCell>
                <TableCell className="totalSize">Total Size</TableCell>
              </TableHead>
              {object.spec.reconcilers.map((reconciler) => {
                const key = crypto
                  .createHash("sha256")
                  .update(JSON.stringify(reconciler))
                  .digest("hex")
                  .substring(0, 16);
                return (
                  <TableRow key={key} sortItem={reconciler} nowrap>
                    <TableCell className="kind">
                      <WithTooltip tooltip={`${reconciler.kind} (${reconciler.apiVersion})`}>
                        {reconciler.kind}
                      </WithTooltip>
                    </TableCell>
                    <TableCell className="running">{reconciler.stats?.running ?? "-"}</TableCell>
                    <TableCell className="failing">{reconciler.stats?.failing ?? "-"}</TableCell>
                    <TableCell className="suspended">{reconciler.stats?.suspended ?? "-"}</TableCell>
                    <TableCell className="totalSize">{reconciler.stats?.totalSize ?? "-"}</TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </div>
        )}

        {object.spec.sync && (
          <>
            <DrawerTitle>Sync Status</DrawerTitle>
            <DrawerItem name="ID">{object.spec.sync.id}</DrawerItem>
            <DrawerItem name="Path" hidden={!object.spec.sync.path}>
              {object.spec.sync.path}
            </DrawerItem>
            <DrawerItem name="Ready">
              <BadgeBoolean value={object.spec.sync.ready} />
            </DrawerItem>
            <DrawerItem name="Status">{object.spec.sync.status}</DrawerItem>
            <DrawerItem name="Source" hidden={!object.spec.sync.source}>
              {object.spec.sync.source}
            </DrawerItem>
          </>
        )}
      </div>
    </>
  );
});
