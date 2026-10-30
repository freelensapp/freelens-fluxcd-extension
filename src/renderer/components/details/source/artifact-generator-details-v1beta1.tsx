import { Common, Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import {
  ArtifactGenerator,
  sourceWatcherReconcileAnnotation,
} from "../../../k8s/fluxcd/source/artifactgenerator-v1beta1";
import { isReconcileDisabled } from "../../../k8s/fluxcd/utils";
import { getMaybeDetailsUrl } from "../../../utils";
import { YamlDump } from "../../yaml-dump";
import styles from "./artifact-generator-details.module.scss";

const { observer } = MobxReact;

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: {
    BadgeBoolean,
    DrawerItem,
    DrawerItemLabels,
    DrawerTitle,
    DurationAbsoluteTimestamp,
    LinkToNamespace,
    LinkToServiceAccount,
    MaybeLink,
    Table,
    TableCell,
    TableHead,
    TableRow,
  },
} = Renderer;

export const ArtifactGeneratorDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<ArtifactGenerator>> =
  observer((props) => {
    const { object } = props;

    return (
      <>
        <DrawerItem name="Resumed">
          <BadgeBoolean value={!isReconcileDisabled(object, sourceWatcherReconcileAnnotation)} />
        </DrawerItem>
        <DrawerItem name="Last Handled Reconcile At" hidden={!object.status?.lastHandledReconcileAt}>
          <DurationAbsoluteTimestamp timestamp={object.status?.lastHandledReconcileAt} />
        </DrawerItem>
        <DrawerItem name="Service Account" hidden={!object.spec?.serviceAccountName}>
          <LinkToServiceAccount name={object.spec?.serviceAccountName} namespace={object.getNs()} />
        </DrawerItem>
        <DrawerItem name="Path Pattern" hidden={!object.spec?.pathPattern}>
          {object.spec?.pathPattern}
        </DrawerItem>
        <DrawerItem name="Observed Sources Digest" hidden={!object.status?.observedSourcesDigest}>
          {object.status?.observedSourcesDigest}
        </DrawerItem>
        <DrawerItemLabels
          name="Common Labels"
          labels={object.spec?.commonMetadata?.labels ?? {}}
          hidden={!object.spec?.commonMetadata?.labels}
        />
        <DrawerItemLabels
          name="Common Annotations"
          labels={object.spec?.commonMetadata?.annotations ?? {}}
          hidden={!object.spec?.commonMetadata?.annotations}
        />

        {!!object.spec?.sources?.length && (
          <>
            <DrawerTitle>Sources</DrawerTitle>
            {object.spec.sources.map((source) => (
              <DrawerItem key={source.alias} name={`@${source.alias}`}>
                <MaybeLink
                  to={getMaybeDetailsUrl(ArtifactGenerator.getSourceRefUrl(source, object))}
                  onClick={stopPropagation}
                >
                  {ArtifactGenerator.getSourceRefText(source)}
                </MaybeLink>
              </DrawerItem>
            ))}
          </>
        )}

        {object.spec?.managedNamespaces && (
          <>
            <DrawerTitle>Managed Namespaces</DrawerTitle>
            <DrawerItem name="Allowed Names">{object.spec.managedNamespaces.allowedNames.join(", ")}</DrawerItem>
            <DrawerItem name="Prune">
              <BadgeBoolean value={object.spec.managedNamespaces.prune} />
            </DrawerItem>
            {object.spec.managedNamespaces.metadata && (
              <DrawerItem name="Metadata">
                <YamlDump data={object.spec.managedNamespaces.metadata} />
              </DrawerItem>
            )}
          </>
        )}

        {!!object.spec?.artifacts?.length && (
          <>
            <DrawerTitle>Artifacts</DrawerTitle>
            {object.spec.artifacts.map((artifact) => (
              <div key={`${artifact.namespace ?? ""}/${artifact.name}`} className={styles.artifact}>
                <DrawerItem name="Name">{artifact.name}</DrawerItem>
                <DrawerItem name="Namespace" hidden={!artifact.namespace}>
                  {artifact.namespace}
                </DrawerItem>
                <DrawerItem name="Inputs From" hidden={!artifact.inputsFrom}>
                  {artifact.inputsFrom}
                </DrawerItem>
                <DrawerItem name="Revision" hidden={!artifact.revision}>
                  {artifact.revision}
                </DrawerItem>
                <DrawerItem name="Origin Revision" hidden={!artifact.originRevision}>
                  {artifact.originRevision}
                </DrawerItem>
                <Table tableId="copy" scrollable={false} className={styles.copy}>
                  <TableHead flat sticky={false}>
                    <TableCell className={styles.from}>From</TableCell>
                    <TableCell className={styles.to}>To</TableCell>
                    <TableCell className={styles.strategy}>Strategy</TableCell>
                    <TableCell className={styles.exclude}>Exclude</TableCell>
                    <TableCell className={styles.optional}>Optional</TableCell>
                  </TableHead>
                  {artifact.copy.map((operation) => (
                    <TableRow key={Renderer.Util.createReactKey(operation)} nowrap>
                      <TableCell className={styles.from}>{operation.from}</TableCell>
                      <TableCell className={styles.to}>{operation.to}</TableCell>
                      <TableCell className={styles.strategy}>{operation.strategy ?? "Overwrite"}</TableCell>
                      <TableCell className={styles.exclude}>{operation.exclude?.join(", ") || "-"}</TableCell>
                      <TableCell className={styles.optional}>{operation.optional ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </Table>
              </div>
            ))}
          </>
        )}

        {!!object.status?.inventory?.length && (
          <>
            <DrawerTitle>Inventory</DrawerTitle>
            <Table tableId="inventory" scrollable={false} className={styles.inventory}>
              <TableHead flat sticky={false}>
                <TableCell className={styles.kind}>Kind</TableCell>
                <TableCell className={styles.name}>Name</TableCell>
                <TableCell className={styles.namespace}>Namespace</TableCell>
                <TableCell className={styles.digest}>Digest</TableCell>
                <TableCell className={styles.filename}>Filename</TableCell>
              </TableHead>
              {object.status.inventory.map((entry) => (
                <TableRow
                  key={`${ArtifactGenerator.getInventoryKind(entry)}/${entry.namespace ?? ""}/${entry.name}`}
                  nowrap
                >
                  <TableCell className={styles.kind}>{ArtifactGenerator.getInventoryKind(entry)}</TableCell>
                  <TableCell className={styles.name}>
                    <MaybeLink
                      to={getMaybeDetailsUrl(ArtifactGenerator.getInventoryRefUrl(entry, object))}
                      onClick={stopPropagation}
                    >
                      {entry.name}
                    </MaybeLink>
                  </TableCell>
                  <TableCell className={styles.namespace}>
                    {entry.namespace ? <LinkToNamespace namespace={entry.namespace} /> : "-"}
                  </TableCell>
                  <TableCell className={styles.digest}>{entry.digest}</TableCell>
                  <TableCell className={styles.filename}>{entry.filename || "-"}</TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}
      </>
    );
  });
