import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { Receiver } from "../../../k8s/fluxcd/notification/receiver-v1";
import { withServedApiVersion } from "../../../k8s/fluxcd/utils";
import { createEnumFromKeys } from "../../../utils";
import { ObjectRefTooltip } from "../../object-ref-tooltip";
import styles from "./receiver-details.module.scss";

import type { ReceiverResource } from "../../../k8s/fluxcd/notification/receiver-v1";

const { observer } = MobxReact;

const {
  Component: {
    Badge,
    BadgeBoolean,
    DrawerItem,
    DrawerTitle,
    Icon,
    LinkToNamespace,
    LinkToObject,
    LinkToSecret,
    Table,
    TableCell,
    TableHead,
    TableRow,
    WithTooltip,
  },
} = Renderer;

const resourceSortable = {
  kind: (resource: ReceiverResource) => resource.kind,
  name: (resource: ReceiverResource) => resource.name,
  namespace: (resource: ReceiverResource) => resource.namespace,
};

const resourceSortByNames = createEnumFromKeys(resourceSortable);

const resourceSortByDefault: { sortBy: keyof typeof resourceSortable; orderBy: Renderer.Component.TableOrderBy } = {
  sortBy: resourceSortByNames.name,
  orderBy: "asc",
};

/** `DefaultOIDCAudience` of notification-controller. */
const defaultOIDCAudience = "notification-controller";

export const ReceiverDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Receiver>> = observer((props) => {
  const { object } = props;
  const namespace = object.getNs();
  const hasMatchLabels = object.spec.resources.some((resource) => resource?.matchLabels);
  const hasFilter = object.spec.resources.some((resource) => resource?.filter);

  return (
    <>
      <div className={styles.details}>
        <DrawerItem name="Resumed">
          <BadgeBoolean value={!object.spec.suspend} />
        </DrawerItem>
        <DrawerItem name="Type">{object.spec.type}</DrawerItem>
        <DrawerItem name="Webhook Path" hidden={!object.status?.webhookPath}>
          <span className={styles.webhookPath}>{object.status?.webhookPath}</span>
        </DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval ?? "10m"}</DrawerItem>
        <DrawerItem name="Events" hidden={!object.spec.events?.length}>
          {object.spec.events?.map((event) => (
            <DrawerItem key={event} name="">
              {event}
            </DrawerItem>
          ))}
        </DrawerItem>
        <DrawerItem name="Resource Filter" hidden={!object.spec.resourceFilter}>
          <code className={styles.expression}>{object.spec.resourceFilter}</code>
        </DrawerItem>
        <DrawerItem name="Credentials" hidden={!object.spec.secretRef}>
          <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
        </DrawerItem>

        {object.spec.oidcProviders && object.spec.oidcProviders.length > 0 && (
          <div>
            <DrawerTitle>OIDC Providers</DrawerTitle>
            {object.spec.oidcProviders.map((provider) => (
              <div key={provider.issuerURL}>
                <div className={styles.title}>
                  <Icon small material="key" />
                  <span>{provider.issuerURL}</span>
                </div>
                <DrawerItem name="Audience">{provider.audience || defaultOIDCAudience}</DrawerItem>
                <DrawerItem name="Variables" hidden={!provider.variables?.length}>
                  {provider.variables?.map((variable) => (
                    <DrawerItem key={variable.name} name={variable.name}>
                      <code className={styles.expression}>{variable.expression}</code>
                    </DrawerItem>
                  ))}
                </DrawerItem>
                <DrawerItem name="Validations">
                  {provider.validations.map((validation) => (
                    <div key={Renderer.Util.createReactKey(validation)} className={styles.validation}>
                      <code className={styles.expression}>{validation.expression}</code>
                      <span>{validation.message}</span>
                    </div>
                  ))}
                </DrawerItem>
              </div>
            ))}
          </div>
        )}

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
              {hasMatchLabels && <TableCell className={styles.matchLabels}>Match Labels</TableCell>}
              {hasFilter && <TableCell className={styles.filter}>Filter</TableCell>}
            </TableHead>
            {object.spec.resources.map((resource) => {
              if (!resource) return null;
              return (
                <TableRow key={Renderer.Util.createReactKey(resource)} sortItem={resource} nowrap>
                  <TableCell className={styles.kind}>
                    <WithTooltip tooltip={<ObjectRefTooltip objectRef={resource} />}>{resource.kind}</WithTooltip>
                  </TableCell>
                  <TableCell className={styles.name}>
                    {resource.name === "*" ? (
                      resource.name
                    ) : (
                      <LinkToObject objectRef={withServedApiVersion(resource)} object={object} />
                    )}
                  </TableCell>
                  <TableCell className={styles.namespace}>
                    <LinkToNamespace namespace={resource.namespace ?? namespace} />
                  </TableCell>
                  {hasMatchLabels && (
                    <TableCell className={styles.matchLabels}>
                      {Object.entries(resource.matchLabels ?? {}).map(([key, value]) => (
                        <Badge key={key} label={`${key}=${value}`} />
                      ))}
                    </TableCell>
                  )}
                  {hasFilter && (
                    <TableCell className={styles.filter}>
                      <WithTooltip>{resource.filter}</WithTooltip>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </Table>
        </div>
      </div>
    </>
  );
});
