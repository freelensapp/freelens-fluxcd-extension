import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { checksum, createEnumFromKeys } from "../../../utils";
import { DurationAbsoluteTimestamp } from "../../duration-absolute";
import { LinkToSecret } from "../../link-to-secret";
import { LinkToServiceAccount } from "../../link-to-service-account";
import { YamlDump } from "../../yaml-dump";
import styles from "./resource-set-input-provider-details.module.scss";
import stylesInline from "./resource-set-input-provider-details.module.scss?inline";

import type { ResourceSetInputProvider, Schedule } from "../../../k8s/fluxcd/controlplane/resourcesetinputprovider-v1";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, Icon, Table, TableCell, TableHead, TableRow, WithTooltip },
} = Renderer;

const schedulesSortable = {
  cron: (schedule: Schedule) => schedule.cron,
  timeZone: (schedule: Schedule) => schedule.timeZone || "UTC",
  window: (schedule: Schedule) => schedule.window || "0s",
};

const SchedulesSortableNames = createEnumFromKeys(schedulesSortable);

const schedulesSortByDefault: {
  sortBy: keyof typeof schedulesSortable;
  orderBy: Renderer.Component.TableOrderBy;
} = {
  sortBy: SchedulesSortableNames.cron,
  orderBy: "asc",
};

export const ResourceSetInputProviderDetails: React.FC<
  Renderer.Component.KubeObjectDetailsProps<ResourceSetInputProvider>
> = observer((props) => {
  const { object } = props;
  const namespace = object.getNs();

  return (
    <>
      <style>{stylesInline}</style>
      <DrawerItem name="Reconciliation Enabled">
        <BadgeBoolean
          value={(object.metadata.annotations?.["fluxcd.controlplane.io/reconcile"] ?? "enabled") === "enabled"}
        />
      </DrawerItem>
      <DrawerItem name="Reconciliation Interval">
        {object.metadata.annotations?.["fluxcd.controlplane.io/reconcileEvery"] ?? "10m (default)"}
      </DrawerItem>
      <DrawerItem name="Reconciliation Timeout">
        {object.metadata.annotations?.["fluxcd.controlplane.io/reconcileTimeout"] ?? "2m (default)"}
      </DrawerItem>

      <DrawerItem name="Last Handled Reconcile At" hidden={!object.status?.lastHandledReconcileAt}>
        <DurationAbsoluteTimestamp timestamp={object.status?.lastHandledReconcileAt} />
      </DrawerItem>

      <DrawerItem name="Last Exported Revision" hidden={!object.status?.lastExportedRevision}>
        {object.status?.lastExportedRevision}
      </DrawerItem>

      <DrawerTitle>Provider Configuration</DrawerTitle>
      <DrawerItem name="Type">{object.spec?.type}</DrawerItem>
      <DrawerItem name="URL" hidden={!object.spec?.url}>
        {object.spec?.url}
      </DrawerItem>
      <DrawerItem name="Service Account" hidden={!object.spec?.serviceAccountName}>
        <LinkToServiceAccount name={object.spec?.serviceAccountName} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="Secret Reference" hidden={!object.spec?.secretRef}>
        <LinkToSecret name={object.spec?.secretRef?.name} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="Certificate Secret Reference" hidden={!object.spec?.certSecretRef}>
        <LinkToSecret name={object.spec?.certSecretRef?.name} namespace={namespace} />
      </DrawerItem>

      {object.spec?.defaultValues && Object.keys(object.spec.defaultValues).length > 0 && (
        <>
          <DrawerTitle>Default Values</DrawerTitle>
          <YamlDump data={object.spec.defaultValues} />
        </>
      )}

      {object.spec?.filter && (
        <>
          <DrawerTitle>Filter Configuration</DrawerTitle>
          <DrawerItem name="Include Branch" hidden={!object.spec.filter.includeBranch}>
            {object.spec.filter.includeBranch}
          </DrawerItem>
          <DrawerItem name="Exclude Branch" hidden={!object.spec.filter.excludeBranch}>
            {object.spec.filter.excludeBranch}
          </DrawerItem>
          <DrawerItem name="Include Tag" hidden={!object.spec.filter.includeTag}>
            {object.spec.filter.includeTag}
          </DrawerItem>
          <DrawerItem name="Exclude Tag" hidden={!object.spec.filter.excludeTag}>
            {object.spec.filter.excludeTag}
          </DrawerItem>
          <DrawerItem name="Labels" hidden={!object.spec.filter.labels || object.spec.filter.labels.length === 0}>
            {object.spec.filter.labels?.join(", ")}
          </DrawerItem>
          <DrawerItem name="Limit" hidden={!object.spec.filter.limit}>
            {object.spec.filter.limit}
          </DrawerItem>
          <DrawerItem name="Semver" hidden={!object.spec.filter.semver}>
            {object.spec.filter.semver}
          </DrawerItem>
        </>
      )}

      {object.spec?.skip && (
        <>
          <DrawerTitle>Skip Configuration</DrawerTitle>
          <DrawerItem name="Labels" hidden={!object.spec.skip.labels || object.spec.skip.labels.length === 0}>
            {object.spec.skip.labels?.join(", ")}
          </DrawerItem>
        </>
      )}

      {object.spec?.schedule && object.spec.schedule.length > 0 && (
        <div className={styles.schedules}>
          <DrawerTitle>Schedules</DrawerTitle>
          <Table
            selectable
            tableId="schedules"
            scrollable={false}
            sortable={schedulesSortable}
            sortByDefault={schedulesSortByDefault}
            sortSyncWithUrl={false}
            className="box grow"
          >
            <TableHead flat sticky={false}>
              <TableCell className="cron" sortBy="cron">
                Cron
              </TableCell>
              <TableCell className="timeZone" sortBy="timeZone">
                Time Zone
              </TableCell>
              <TableCell className="window" sortBy="window">
                Window
              </TableCell>
            </TableHead>
            {object.spec.schedule.map((schedule, index) => (
              <TableRow key={`${schedule.cron}-${index}`} sortItem={schedule} nowrap>
                <TableCell className="cron">
                  <WithTooltip>{schedule.cron}</WithTooltip>
                </TableCell>
                <TableCell className="timeZone">
                  <WithTooltip>{schedule.timeZone || "UTC"}</WithTooltip>
                </TableCell>
                <TableCell className="window">
                  <WithTooltip>{schedule.window || "0s"}</WithTooltip>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      )}

      {object.status?.nextSchedule && (
        <>
          <DrawerTitle>Next Schedule</DrawerTitle>
          <DrawerItem name="Cron">{object.status.nextSchedule.cron}</DrawerItem>
          <DrawerItem name="Time Zone">{object.status.nextSchedule.timeZone || "UTC"}</DrawerItem>
          <DrawerItem name="When">
            <DurationAbsoluteTimestamp timestamp={object.status.nextSchedule.when} />
          </DrawerItem>
        </>
      )}

      {object.status?.exportedInputs && object.status.exportedInputs.length > 0 && (
        <div className={styles.exportedInputs}>
          <DrawerTitle>Exported Inputs</DrawerTitle>
          {object.status.exportedInputs.map((input, index) => (
            <div key={checksum(input)}>
              <div className={styles.title}>
                <Icon small material="list" />
                <span>{index + 1}</span>
              </div>
              <DrawerItem name="">
                <YamlDump data={input} />
              </DrawerItem>
            </div>
          ))}
        </div>
      )}
    </>
  );
});
