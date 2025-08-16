import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { Receiver } from "../../../k8s/fluxcd/notification/receiver";
import { getRefUrl } from "../../../k8s/fluxcd/utils";
import { createEnumFromKeys, getMaybeDetailsUrl } from "../../../utils";
import { ObjectRefTooltip } from "../../object-ref-tooltip";
import styles from "./receiver-details.module.scss";
import stylesInline from "./receiver-details.module.scss?inline";

import type { NamespacedObjectKindReference } from "../../../k8s/fluxcd/types";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, MaybeLink, Table, TableCell, TableHead, TableRow, WithTooltip },
  K8sApi: { namespacesApi, secretsApi },
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
          <MaybeLink
            key="link"
            to={getMaybeDetailsUrl(secretsApi.formatUrlForNotListing({ name: object.spec.secretRef?.name, namespace }))}
            onClick={stopPropagation}
          >
            {object.spec.secretRef?.name}
          </MaybeLink>
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
                    <MaybeLink to={getMaybeDetailsUrl(getRefUrl(resource, object))} onClick={stopPropagation}>
                      <WithTooltip>{resource.name}</WithTooltip>
                    </MaybeLink>
                  </TableCell>
                  <TableCell className={styles.namespace}>
                    <MaybeLink
                      key="link"
                      to={getMaybeDetailsUrl(
                        namespacesApi.formatUrlForNotListing({
                          name: resource.namespace ?? namespace,
                        }),
                      )}
                      onClick={stopPropagation}
                    >
                      <WithTooltip>{resource.namespace ?? namespace}</WithTooltip>
                    </MaybeLink>
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
