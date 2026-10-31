import { Common, Renderer } from "@freelensapp/extensions";
import { Base64 } from "js-base64";
import { dump } from "js-yaml";
import * as MobxReact from "mobx-react";
import { useEffect, useState } from "react";
import { Kustomization, type KustomizationStore } from "../../../k8s/fluxcd/kustomize/kustomization-v1";
import { NamespacedObjectKindReference } from "../../../k8s/fluxcd/types";
import { getRefUrl, withFluxKind } from "../../../k8s/fluxcd/utils";
import { createEnumFromKeys, defaultYamlDumpOptions, getHeight, getMaybeDetailsUrl } from "../../../utils";
import { ObjectRefTooltip } from "../../object-ref-tooltip";
import { SpecPatches } from "../../spec-patches";
import { getConditionClass, getConditionText, getStatusMessage } from "../../status-conditions";
import { StatusHistory } from "../../status-history";
import { StatusInventory } from "../../status-inventory";
import { YamlDump } from "../../yaml-dump";
import styles from "./kustomization-details.module.scss";

const { observer } = MobxReact;

const {
  Component: {
    Badge,
    BadgeBoolean,
    DrawerItem,
    DrawerItemLabels,
    DrawerTitle,
    Icon,
    LinkToConfigMap,
    LinkToNamespace,
    LinkToObject,
    LinkToServiceAccount,
    LinkToSecret,
    MaybeLink,
    MonacoEditor,
    Table,
    TableCell,
    TableHead,
    TableRow,
    WithTooltip,
  },
  K8sApi: { configMapApi, secretsApi },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

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

export const KustomizationDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Kustomization>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();
    const store = Kustomization.getStore() as KustomizationStore;

    const [substituteFromYaml, setSubstituteFromYaml] = useState<Record<string, string>>({});

    useEffect(() => {
      let mounted = true;
      (async () => {
        const substituteFromYamlResult: Record<string, string> = {};
        for (const substituteFrom of object.spec.postBuild?.substituteFrom ?? []) {
          const api = substituteFrom.kind.toLowerCase() === "secret" ? secretsApi : configMapApi;
          const name = substituteFrom.name;

          const variablesObject = await api.get({ name, namespace });
          if (!variablesObject) continue;

          const variablesFrom: Record<string, string> = {};

          for (let [key, value] of Object.entries(variablesObject.data)) {
            if (value === undefined) continue;
            if (substituteFrom.kind.toLowerCase() === "secret" && Base64.isValid(value)) {
              variablesFrom[key] = Base64.decode(value);
            } else {
              variablesFrom[key] = value;
            }
          }

          substituteFromYamlResult[`${namespace}/${name}`] = dump(variablesFrom, defaultYamlDumpOptions).trimEnd();
        }

        if (mounted) setSubstituteFromYaml(substituteFromYamlResult);
      })();
      return () => {
        mounted = false;
      };
    }, [object, namespace]);

    const sourceRefUrl = Kustomization.getSourceRefUrl(object);
    const substituteYaml =
      object.spec.postBuild?.substitute && dump(object.spec.postBuild?.substitute, defaultYamlDumpOptions).trimEnd();

    const kubeConfigSecretName = object.spec.kubeConfig?.secretRef?.name;
    const kubeConfigConfigMapName = object.spec.kubeConfig?.configMapRef?.name;

    return (
      <>
        <div className={styles.details}>
          <DrawerItem name="Resumed">
            <BadgeBoolean value={!object.spec.suspend} />
          </DrawerItem>
          <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
          <DrawerItem name="Retry Interval" hidden={!object.spec.retryInterval}>
            {object.spec.retryInterval}
          </DrawerItem>
          <DrawerItem name="Path" hidden={!object.spec.path}>
            {object.spec.path}
          </DrawerItem>
          <DrawerItem name="Source">
            <MaybeLink key="link" to={getMaybeDetailsUrl(sourceRefUrl)} onClick={stopPropagation}>
              {Kustomization.getSourceRefText(object)}
            </MaybeLink>
          </DrawerItem>
          <DrawerItem name="Target Namespace" hidden={!object.spec.targetNamespace}>
            <LinkToNamespace namespace={object.spec.targetNamespace} />
          </DrawerItem>
          <DrawerItem name="Name Prefix" hidden={!object.spec.namePrefix}>
            {object.spec.namePrefix}
          </DrawerItem>
          <DrawerItem name="Name Suffix" hidden={!object.spec.nameSuffix}>
            {object.spec.nameSuffix}
          </DrawerItem>
          <DrawerItem name="Components" hidden={!object.spec.components?.length}>
            {object.spec.components?.join(", ")}
          </DrawerItem>
          <DrawerItem name="Ignore Missing Components" hidden={!object.spec.ignoreMissingComponents}>
            <BadgeBoolean value={object.spec.ignoreMissingComponents ?? false} />
          </DrawerItem>
          <DrawerItem name="Build Metadata" hidden={!object.spec.buildMetadata?.length}>
            {object.spec.buildMetadata?.join(", ")}
          </DrawerItem>
          <DrawerItem name="Prune">
            <BadgeBoolean value={object.spec.prune ?? false} />
          </DrawerItem>
          <DrawerItem name="Deletion Policy" hidden={!object.spec.deletionPolicy}>
            {object.spec.deletionPolicy}
          </DrawerItem>
          <DrawerItem name="Wait">
            <BadgeBoolean value={object.spec.wait ?? false} />
          </DrawerItem>
          <DrawerItem name="Timeout" hidden={!object.spec.timeout}>
            {object.spec.timeout}
          </DrawerItem>
          <DrawerItem name="Force">
            <BadgeBoolean value={object.spec.force ?? false} />
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
          <DrawerItem name="Service Account" hidden={!object.spec.serviceAccountName}>
            <LinkToServiceAccount name={object.spec.serviceAccountName} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Kube Config" hidden={!kubeConfigSecretName && !kubeConfigConfigMapName}>
            {kubeConfigSecretName && <LinkToSecret name={kubeConfigSecretName} namespace={namespace} />}
            {kubeConfigConfigMapName && <LinkToConfigMap name={kubeConfigConfigMapName} namespace={namespace} />}
          </DrawerItem>
          <DrawerItem name="Last Applied Revision">{object.status?.lastAppliedRevision}</DrawerItem>
          <DrawerItem name="Last Applied Origin Revision" hidden={!object.status?.lastAppliedOriginRevision}>
            {object.status?.lastAppliedOriginRevision}
          </DrawerItem>
          <DrawerItem
            name="Last Attempted Revision"
            hidden={
              !object.status?.lastAttemptedRevision ||
              object.status.lastAttemptedRevision === object.status.lastAppliedRevision
            }
          >
            {object.status?.lastAttemptedRevision}
          </DrawerItem>

          {object.spec.dependsOn && (
            <div>
              <DrawerTitle>Depends On</DrawerTitle>
              {object.spec.dependsOn.map((dependency) => {
                const reference = store.getByName(dependency.name, dependency.namespace ?? namespace);
                return (
                  <div className="dependency" key={dependency.name + (dependency.namespace ?? "")}>
                    <div className={styles.title}>
                      <Icon small material="list" />
                    </div>

                    <DrawerItem name="Name">
                      <LinkToObject objectRef={withFluxKind(dependency, Kustomization.kind)} object={object} />
                    </DrawerItem>
                    <DrawerItem name="Namespace">
                      <LinkToNamespace namespace={dependency.namespace ?? namespace} />
                    </DrawerItem>
                    <DrawerItem name="Ready Expression" hidden={!dependency.readyExpr}>
                      <YamlDump data={dependency.readyExpr} />
                    </DrawerItem>
                    <DrawerItem name="Revision" hidden={!reference?.status?.lastAppliedRevision}>
                      {reference?.status?.lastAppliedRevision}
                    </DrawerItem>
                    <DrawerItem name="Condition" hidden={!reference}>
                      {reference ? (
                        <Badge
                          className={getConditionClass(reference.status?.conditions, reference.spec.suspend)}
                          label={getConditionText(reference.status?.conditions, reference.spec.suspend)}
                        />
                      ) : (
                        ""
                      )}
                    </DrawerItem>
                    <DrawerItem name="Status" hidden={!reference}>
                      {reference && getStatusMessage(reference.status?.conditions)}
                    </DrawerItem>
                  </div>
                );
              })}
            </div>
          )}

          <SpecPatches patches={object.spec.patches} />

          {object.spec.images && (
            <div>
              <DrawerTitle>Images</DrawerTitle>
              {object.spec.images.map((image) => {
                return (
                  <div key={image.name}>
                    <div className={styles.title}>
                      <Icon small material="list" />
                    </div>
                    <DrawerItem name="Name">{image.name}</DrawerItem>
                    <DrawerItem name="New Name" hidden={!image.newName}>
                      {image.newName}
                    </DrawerItem>
                    <DrawerItem name="New Tag" hidden={!image.newTag}>
                      {image.newTag}
                    </DrawerItem>
                    <DrawerItem name="Digest" hidden={!image.digest}>
                      {image.digest}
                    </DrawerItem>
                  </div>
                );
              })}
            </div>
          )}

          {object.spec.postBuild && (
            <div className={styles.substitution}>
              <DrawerTitle>Post Build Variable Substitution</DrawerTitle>
              <DrawerItem name="Strategy" hidden={!object.spec.postBuild.substituteStrategy}>
                {object.spec.postBuild.substituteStrategy}
              </DrawerItem>
              {object.spec.postBuild.substituteFrom?.map((substituteFrom) => {
                const api = substituteFrom.kind.toLowerCase() === "secret" ? secretsApi : configMapApi;
                const name = substituteFrom.name;
                const substituteFromYamlValue = substituteFromYaml[`${namespace}/${name}`] ?? "";

                return (
                  <div key={name}>
                    <div className={styles.title}>
                      <Icon small material="list" />
                    </div>
                    <DrawerItem name="Kind">{substituteFrom.kind}</DrawerItem>
                    <DrawerItem name="Name">
                      <MaybeLink
                        key="link"
                        to={getMaybeDetailsUrl(api.formatUrlForNotListing({ name, namespace }))}
                        onClick={stopPropagation}
                      >
                        {name}
                      </MaybeLink>
                    </DrawerItem>
                    <DrawerItem name="Optional" hidden={!substituteFrom.optional}>
                      <BadgeBoolean value={substituteFrom.optional ?? false} />
                    </DrawerItem>
                    <div className="DrawerItem">Variables</div>
                    <MonacoEditor
                      readOnly
                      id={`variablesFromYaml-${namespace}-${name}`}
                      className={styles.editor}
                      style={{
                        minHeight: getHeight(substituteFromYamlValue),
                      }}
                      value={substituteFromYamlValue}
                      setInitialHeight
                      options={{
                        scrollbar: {
                          alwaysConsumeMouseWheel: false,
                        },
                      }}
                    />
                  </div>
                );
              })}
              {substituteYaml && (
                <div>
                  <div className={styles.title}>
                    <Icon small material="list" />
                  </div>
                  <div className="DrawerItem">Variables</div>
                  <MonacoEditor
                    readOnly
                    id={`substituteYaml-${namespace}`}
                    className={styles.editor}
                    style={{
                      minHeight: getHeight(substituteYaml),
                    }}
                    value={substituteYaml}
                    setInitialHeight
                    options={{
                      scrollbar: {
                        alwaysConsumeMouseWheel: false,
                      },
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {object.spec.decryption && (
            <div>
              <DrawerTitle>Decryption</DrawerTitle>
              <DrawerItem name="Provider">{object.spec.decryption.provider}</DrawerItem>
              <DrawerItem name="Service Account" hidden={!object.spec.decryption.serviceAccountName}>
                <LinkToServiceAccount name={object.spec.decryption.serviceAccountName} namespace={namespace} />
              </DrawerItem>
              <DrawerItem name="Secret Name" hidden={!object.spec.decryption.secretRef}>
                {object.spec.decryption.secretRef && (
                  <LinkToSecret name={object.spec.decryption.secretRef.name} namespace={namespace} />
                )}
              </DrawerItem>
            </div>
          )}

          {object.spec.healthChecks && (
            <div className={styles.healthChecks}>
              <DrawerTitle>Health Checks</DrawerTitle>
              <Table
                selectable
                tableId="healthChecks"
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
                {object.spec.healthChecks.map((healthCheck) => (
                  <TableRow
                    key={`${healthCheck.namespace}_${healthCheck.name}_${healthCheck.kind}`}
                    sortItem={healthCheck}
                    nowrap
                  >
                    <TableCell className={styles.kind}>
                      <WithTooltip tooltip={<ObjectRefTooltip objectRef={healthCheck} />}>
                        {healthCheck.kind}
                      </WithTooltip>
                    </TableCell>
                    <TableCell className={styles.name}>
                      <MaybeLink to={getMaybeDetailsUrl(getRefUrl(healthCheck, object))} onClick={stopPropagation}>
                        <WithTooltip>{healthCheck.name}</WithTooltip>
                      </MaybeLink>
                    </TableCell>
                    <TableCell className={styles.namespace}>
                      <LinkToNamespace namespace={healthCheck.namespace ?? namespace} />
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          )}

          {object.spec.healthCheckExprs && (
            <div>
              <DrawerTitle>Health Check Expressions</DrawerTitle>
              {object.spec.healthCheckExprs.map((healthCheck) => (
                <div key={Renderer.Util.createReactKey(healthCheck)}>
                  <div className={styles.title}>
                    <Icon small material="list" />
                  </div>
                  <DrawerItem name="API Version">{healthCheck.apiVersion}</DrawerItem>
                  <DrawerItem name="Kind" hidden={!healthCheck.kind}>
                    {healthCheck.kind}
                  </DrawerItem>
                  <DrawerItem name="Current">
                    <YamlDump data={healthCheck.current} />
                  </DrawerItem>
                  <DrawerItem name="In Progress" hidden={!healthCheck.inProgress}>
                    <YamlDump data={healthCheck.inProgress} />
                  </DrawerItem>
                  <DrawerItem name="Failed" hidden={!healthCheck.failed}>
                    <YamlDump data={healthCheck.failed} />
                  </DrawerItem>
                </div>
              ))}
            </div>
          )}

          {object.spec.ignore && (
            <div>
              <DrawerTitle>Drift Detection Ignore Rules</DrawerTitle>
              {object.spec.ignore.map((rule) => (
                <div key={Renderer.Util.createReactKey(rule)}>
                  <div className={styles.title}>
                    <Icon small material="list" />
                  </div>
                  <DrawerItem name="Paths">{rule.paths.join(", ")}</DrawerItem>
                  <DrawerItem name="Target" hidden={!rule.target}>
                    <YamlDump data={rule.target} />
                  </DrawerItem>
                </div>
              ))}
            </div>
          )}

          <StatusInventory inventory={object.status?.inventory} object={object} />

          <StatusHistory history={object.status?.history} />
        </div>
      </>
    );
  },
);
