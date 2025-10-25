import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { Receiver } from "../../../k8s/fluxcd/notification/receiver-v1beta1";
import { createEnumFromKeys } from "../../../utils";
import { LinkToNamespace } from "../../link-to-namespace";
import { LinkToObject } from "../../link-to-object";
import { LinkToSecret } from "../../link-to-secret";
import { ObjectRefTooltip } from "../../object-ref-tooltip";
import styles from "./receiver-details.module.scss";
import stylesInline from "./receiver-details.module.scss?inline";

import type { NamespacedObjectKindReference } from "../../../k8s/fluxcd/types";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, Table, TableCell, TableHead, TableRow, WithTooltip },
} = Renderer;

const resourceSortable = {
  kind: (resource: NamespacedObjectKindReference) => resource.kind,
  name: (resource: NamespacedObjectKindReference) => resource.name,
  namespace: (resource: NamespacedObjectKindReference) => resource.namespace,
};

const resourceSortByNames = createEnumFromKeys(resourceSortable);

const resourceSortByDefault: { sortBy: keyof typeof resourceSortable; orderBy: Renderer.Component.TableOrderBy } = {
  sortBy: resourceSortByNames.name,
  orderBy: "asc",
};

export const ReceiverDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Receiver>> = observer((props) => {
  const { object } = props;
  const namespace = object.getNs();

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Resumed">
          <BadgeBoolean value={!object.spec.suspend} />
        </DrawerItem>
        <DrawerItem name="Type">{object.spec.type}</DrawerItem>
        <DrawerItem name="Events">
          {object.spec.events?.map((event, index: number) => (
            <DrawerItem key={index} name="">
              {event}
            </DrawerItem>
          ))}
        </DrawerItem>
        <DrawerItem name="Credentials" hidden={!object.spec.secretRef}>
          <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
        </DrawerItem>

        <div className={styles.resources}>
          <DrawerTitle>Resources</DrawerTitle>
          <Table
            selectable
            tableId="inventory"
            scrollable={false}
            sortable={resourceSortable}
            sortByDefault={resourceSortByDefault}
            sortSyncWithUrl={false}
          >
            <TableHead flat sticky={false}>
              <TableCell className={styles.kind} sortBy={resourceSortByNames.kind}>
                Kind
              </TableCell>
              <TableCell className={styles.name} sortBy={resourceSortByNames.name}>
                Name
              </TableCell>
              <TableCell className={styles.namespace} sortBy={resourceSortByNames.namespace}>
                Namespace
              </TableCell>
            </TableHead>
            {object.spec.resources.map((resource) => {
              if (!resource) return null;
              return (
                <TableRow key={`${resource.kind}-${resource.name}`} sortItem={resource} nowrap>
                  <TableCell className={styles.kind}>
                    <WithTooltip tooltip={<ObjectRefTooltip objectRef={resource} />}>{resource.kind}</WithTooltip>
                  </TableCell>
                  <TableCell className={styles.name}>
                    <LinkToObject objectRef={resource} object={object} />
                  </TableCell>
                  <TableCell className={styles.namespace}>
                    <LinkToNamespace namespace={resource.namespace ?? namespace} />
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </div>
      </div>
    </>
  );
});
