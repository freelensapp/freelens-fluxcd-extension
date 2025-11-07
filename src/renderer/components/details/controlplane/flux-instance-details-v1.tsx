import { Renderer } from "@freelensapp/extensions";
import crypto from "crypto";
import { observer } from "mobx-react";
import React from "react";
import { createEnumFromKeys } from "../../../utils";
import { DurationAbsoluteTimestamp } from "../../duration-absolute";
import { LinkToSecret } from "../../link-to-secret";
import { LinkToServiceAccount } from "../../link-to-service-account";
import { LinkToStorageClass } from "../../link-to-storage-class";
import { SpecPatches } from "../../spec-patches";
import { StatusInventory } from "../../status-inventory";
import styles from "./flux-instance-details.module.scss";
import stylesInline from "./flux-instance-details.module.scss?inline";

import type { FluxInstance } from "../../../k8s/fluxcd/controlplane/fluxinstance-v1";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerItemLabels, DrawerTitle, Icon, Table, TableCell, TableHead, TableRow },
} = Renderer;

const componentsSortable = {
  name: (component: any) => component.name,
  repository: (component: any) => component.repository,
  tag: (component: any) => component.tag,
};

const ComponentsSortableNames = createEnumFromKeys(componentsSortable);

const componentsSortByDefault: {
  sortBy: keyof typeof componentsSortable;
  orderBy: Renderer.Component.TableOrderBy;
} = {
  sortBy: ComponentsSortableNames.name,
  orderBy: "asc",
};

export const FluxInstanceDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<FluxInstance>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();

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
            {object.metadata.annotations?.["fluxcd.controlplane.io/reconcileEvery"] ?? "1h (default)"}
          </DrawerItem>
          <DrawerItem name="Artifact Reconciliation Interval">
            {object.metadata.annotations?.["fluxcd.controlplane.io/reconcileArtifactEvery"] ?? "10m (default)"}
          </DrawerItem>
          <DrawerItem name="Reconciliation Timeout">
            {object.metadata.annotations?.["fluxcd.controlplane.io/reconcileTimeout"] ?? "5m (default)"}
          </DrawerItem>
          <DrawerItem name="Last Handled Reconcile At" hidden={!object.status?.lastHandledReconcileAt}>
            <DurationAbsoluteTimestamp timestamp={object.status?.lastHandledReconcileAt} />
          </DrawerItem>
          <DrawerItem name="Last Handled Force At" hidden={!object.status?.lastHandledForceAt}>
            <DurationAbsoluteTimestamp timestamp={object.status?.lastHandledForceAt} />
          </DrawerItem>
          <DrawerItem name="Last Attempted Revision" hidden={!object.status?.lastAttemptedRevision}>
            {object.status?.lastAttemptedRevision}
          </DrawerItem>
          <DrawerItem name="Last Applied Revision" hidden={!object.status?.lastAppliedRevision}>
            {object.status?.lastAppliedRevision}
          </DrawerItem>
          <DrawerItem name="Last Artifact Revision" hidden={!object.status?.lastArtifactRevision}>
            {object.status?.lastArtifactRevision}
          </DrawerItem>
          <DrawerItem name="Wait">
            <BadgeBoolean value={object.spec.wait ?? true} />
          </DrawerItem>
          <DrawerItem name="Migrate Resources">
            <BadgeBoolean value={object.spec.migrateResources ?? true} />
          </DrawerItem>
          <DrawerItem name="Components" hidden={!object.spec.components?.length}>
            {object.spec.components?.map((component) => (
              <DrawerItem name="" key={component}>
                {component}
              </DrawerItem>
            ))}
          </DrawerItem>
          <DrawerItemLabels
            name="Common Labels"
            labels={object.spec.commonMetadata?.labels ?? {}}
            hidden={!object.spec.commonMetadata?.labels}
          />
          <DrawerItemLabels
            name="Common Annotations"
            labels={object.spec.commonMetadata?.annotations ?? {}}
            hidden={!object.spec.commonMetadata?.annotations}
          />

          <DrawerTitle>Distribution</DrawerTitle>
          <DrawerItem name="Version">{object.spec.distribution.version}</DrawerItem>
          <DrawerItem name="Registry">{object.spec.distribution.registry}</DrawerItem>
          <DrawerItem name="Image Pull Secret" hidden={!object.spec.distribution.imagePullSecret}>
            <LinkToSecret name={object.spec.distribution.imagePullSecret} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Artifact" hidden={!object.spec.distribution.artifact}>
            {object.spec.distribution.artifact}
          </DrawerItem>
          <DrawerItem name="Artifact Pull Secret" hidden={!object.spec.distribution.artifactPullSecret}>
            <LinkToSecret name={object.spec.distribution.artifactPullSecret} namespace={namespace} />
          </DrawerItem>

          {object.spec.cluster && (
            <>
              <DrawerTitle>Cluster Configuration</DrawerTitle>
              <DrawerItem name="Domain" hidden={!object.spec.cluster.domain}>
                {object.spec.cluster.domain}
              </DrawerItem>
              <DrawerItem name="Multitenant">
                <BadgeBoolean value={object.spec.cluster.multitenant} />
              </DrawerItem>
              <DrawerItem
                name="Tenant Default Service Account"
                hidden={!object.spec.cluster.tenantDefaultServiceAccount}
              >
                <LinkToServiceAccount name={object.spec.cluster.tenantDefaultServiceAccount} namespace={namespace} />
              </DrawerItem>
              <DrawerItem
                name="Object Level Workload Identity"
                hidden={!object.spec.cluster.objectLevelWorkloadIdentity}
              >
                {object.spec.cluster.objectLevelWorkloadIdentity}
              </DrawerItem>
              <DrawerItem name="Network Policy">
                <BadgeBoolean value={object.spec.cluster.networkPolicy} />
              </DrawerItem>
              <DrawerItem name="Type" hidden={!object.spec.cluster.type}>
                {object.spec.cluster.type}
              </DrawerItem>
              <DrawerItem name="Size" hidden={!object.spec.cluster.size}>
                {object.spec.cluster.size}
              </DrawerItem>
            </>
          )}

          {object.spec.sharding && (
            <>
              <DrawerTitle>Sharding</DrawerTitle>
              <DrawerItem name="Key" hidden={!object.spec.sharding.key}>
                {object.spec.sharding.key}
              </DrawerItem>
              <DrawerItem name="Shards">{object.spec.sharding.shards.join(", ")}</DrawerItem>
              <DrawerItem name="Storage" hidden={!object.spec.sharding.storage}>
                {object.spec.sharding.storage}
              </DrawerItem>
            </>
          )}

          {object.spec.storage && (
            <>
              <DrawerTitle>Storage</DrawerTitle>
              <DrawerItem name="Class">
                <LinkToStorageClass storageClassName={object.spec.storage.class} />
              </DrawerItem>
              <DrawerItem name="Size">{object.spec.storage.size}</DrawerItem>
            </>
          )}

          <SpecPatches patches={object.spec.kustomize?.patches} />

          {object.spec.sync && (
            <div className={styles.sync}>
              <DrawerTitle>Sync Configuration</DrawerTitle>
              <DrawerItem name="Name" hidden={!object.spec.sync.name}>
                {object.spec.sync.name}
              </DrawerItem>
              <DrawerItem name="Interval" hidden={!object.spec.sync.interval}>
                {object.spec.sync.interval}
              </DrawerItem>
              <DrawerItem name="Kind">{object.spec.sync.kind}</DrawerItem>
              <DrawerItem name="URL">{object.spec.sync.url}</DrawerItem>
              <DrawerItem name="Ref">{object.spec.sync.ref}</DrawerItem>
              <DrawerItem name="Path">{object.spec.sync.path}</DrawerItem>
              <DrawerItem name="Pull Secret" hidden={!object.spec.sync.pullSecret}>
                <LinkToSecret name={object.spec.sync.pullSecret} namespace={namespace} />
              </DrawerItem>
              <DrawerItem name="Provider" hidden={!object.spec.sync.provider}>
                {object.spec.sync.provider}
              </DrawerItem>
            </div>
          )}

          {object.status?.components && object.status.components.length > 0 && (
            <div className={styles.components}>
              <DrawerTitle>Component Images</DrawerTitle>
              <Table
                selectable
                tableId="components"
                scrollable={false}
                sortable={componentsSortable}
                sortByDefault={componentsSortByDefault}
                sortSyncWithUrl={false}
                className="box grow"
              >
                <TableHead flat sticky={false}>
                  <TableCell className="name" sortBy="name">
                    Name
                  </TableCell>
                  <TableCell className="repository" sortBy="repository">
                    Repository
                  </TableCell>
                  <TableCell className="tag" sortBy="tag">
                    Tag
                  </TableCell>
                  <TableCell className="digest">Digest</TableCell>
                </TableHead>
                {object.status.components.map((component) => {
                  const key = crypto
                    .createHash("sha256")
                    .update(JSON.stringify(component))
                    .digest("hex")
                    .substring(0, 16);
                  return (
                    <TableRow key={key} sortItem={component} nowrap>
                      <TableCell className="name">{component.name}</TableCell>
                      <TableCell className="repository">{component.repository}</TableCell>
                      <TableCell className="tag">{component.tag}</TableCell>
                      <TableCell className="digest">{component.digest || "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </Table>
            </div>
          )}

          <StatusInventory inventory={object.status?.inventory} object={object} />

          {object.status?.history && object.status.history.length > 0 && (
            <div className={styles.history}>
              <DrawerTitle>History</DrawerTitle>
              {object.status.history.map((snapshot) => (
                <div key={`${snapshot.digest}`} className={styles.snapshot}>
                  <div className="title flex gaps">
                    <Icon small material="history" />
                  </div>
                  <DrawerItem name="Digest">{snapshot.digest}</DrawerItem>
                  <DrawerItem name="First Reconciled">
                    <DurationAbsoluteTimestamp timestamp={snapshot.firstReconciled} />
                  </DrawerItem>
                  <DrawerItem name="Last Reconciled">
                    <DurationAbsoluteTimestamp timestamp={snapshot.lastReconciled} />
                  </DrawerItem>
                  <DrawerItem name="Last Reconciled Duration">{snapshot.lastReconciledDuration}</DrawerItem>
                  <DrawerItem name="Last Reconciled Status">{snapshot.lastReconciledStatus}</DrawerItem>
                  <DrawerItem name="Total Reconciliations">{snapshot.totalReconciliations}</DrawerItem>
                  <DrawerItemLabels name="Metadata" labels={snapshot.metadata ?? {}} hidden={!snapshot.metadata} />
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  },
);
