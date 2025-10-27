import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { createEnumFromKeys } from "../utils";
import { LinkToNamespace } from "./link-to-namespace";
import { LinkToObject } from "./link-to-object";
import { ObjectRefTooltip } from "./object-ref-tooltip";
import styles from "./status-inventory.module.scss";
import stylesInline from "./status-inventory.module.scss?inline";

import type { NamespacedObjectKindReference, ResourceInventory, ResourceRef } from "../k8s/fluxcd/types";

const {
  Component: { DrawerTitle, Table, TableHead, TableCell, TableRow, WithTooltip },
} = Renderer;

const referenceSortable = {
  kind: (reference: NamespacedObjectKindReference) => reference.kind,
  name: (reference: NamespacedObjectKindReference) => reference.name,
  namespace: (reference: NamespacedObjectKindReference) => reference.namespace,
};

const referenceSortByNames = createEnumFromKeys(referenceSortable);

const referenceSortByDefault: { sortBy: keyof typeof referenceSortable; orderBy: Renderer.Component.TableOrderBy } = {
  sortBy: referenceSortByNames.name,
  orderBy: "asc",
};

function inventoryResourceRefToObjectRef(resource: ResourceRef): NamespacedObjectKindReference | undefined {
  try {
    const [namespace, name, group, kind] = resource.id.split("_");
    const { v } = resource;
    return {
      apiVersion: `${group}/${v}`,
      kind,
      name,
      namespace,
    };
  } catch (error) {
    return;
  }
}

export interface StatusInventoryProps {
  inventory?: ResourceInventory;
  object: Renderer.K8sApi.LensExtensionKubeObject;
}

export const StatusInventory: React.FC<StatusInventoryProps> = observer((props) => {
  const { inventory, object } = props;

  if (!inventory) return null;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.inventory}>
        <DrawerTitle>Inventory</DrawerTitle>
        <Table
          selectable
          tableId="inventory"
          scrollable={false}
          sortable={referenceSortable}
          sortByDefault={referenceSortByDefault}
          sortSyncWithUrl={false}
        >
          <TableHead flat sticky={false}>
            <TableCell className={styles.kind} sortBy={referenceSortByNames.kind}>
              Kind
            </TableCell>
            <TableCell className={styles.name} sortBy={referenceSortByNames.name}>
              Name
            </TableCell>
            <TableCell className={styles.namespace} sortBy={referenceSortByNames.namespace}>
              Namespace
            </TableCell>
          </TableHead>
          {inventory?.entries.map((inventoryResourceRef) => {
            const objectRef = inventoryResourceRefToObjectRef(inventoryResourceRef);
            if (!objectRef) return null;
            return (
              <TableRow key={inventoryResourceRef.id} sortItem={objectRef} nowrap>
                <TableCell className={styles.kind}>
                  <WithTooltip tooltip={<ObjectRefTooltip objectRef={objectRef} />}>{objectRef.kind}</WithTooltip>
                </TableCell>
                <TableCell className={styles.name}>
                  <LinkToObject objectRef={objectRef} object={object} />
                </TableCell>
                <TableCell className={styles.namespace}>
                  <LinkToNamespace namespace={objectRef.namespace ?? object.getNs()} />
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      </div>
    </>
  );
});
