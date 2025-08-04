import { Common, Renderer } from "@freelensapp/extensions";
import crypto from "crypto";
import { Base64 } from "js-base64";
import yaml from "js-yaml";
import React, { useEffect, useState } from "react";
import {
  Kustomization,
  type KustomizationApi,
  type KustomizationStore,
} from "../../../k8s/fluxcd/kustomize/kustomization";
import { NamespacedObjectKindReference, type ResourceRef } from "../../../k8s/fluxcd/types";
import { getRefUrl } from "../../../k8s/fluxcd/utils";
import {
  createEnumFromKeys,
  defaultYamlDumpOptions,
  getConditionClass,
  getConditionMessage,
  getConditionText,
  getHeight,
  getMaybeDetailsUrl,
} from "../../../utils";
import { MaybeLink } from "../../maybe-link";
import styles from "./kustomization-details.module.scss";
import stylesInline from "./kustomization-details.module.scss?inline";

const {
  Component: {
    Badge,
    BadgeBoolean,
    DrawerItem,
    DrawerTitle,
    Icon,
    MonacoEditor,
    Table,
    TableCell,
    TableHead,
    TableRow,
    WithTooltip,
  },
  K8sApi: { configMapApi, namespacesApi, secretsApi, serviceAccountsApi },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

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

function inventoryKindTooltip(objectRef: NamespacedObjectKindReference) {
  return (
    <span>
      <b>apiVersion:</b>&nbsp;{objectRef.apiVersion}
      <br />
      <b>kind:</b>&nbsp;{objectRef.kind}
    </span>
  );
}

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

export const KustomizationDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Kustomization>> = (props) => {
  const { object } = props;
  const namespace = object.getNs();
  const api = Kustomization.getApi() as KustomizationApi;
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

        substituteFromYamlResult[`${namespace}/${name}`] = yaml.dump(variablesFrom, defaultYamlDumpOptions).trimEnd();
      }

      if (mounted) setSubstituteFromYaml(substituteFromYamlResult);
    })();
    return () => {
      mounted = false;
    };
  }, [object, namespace]);

  const sourceRefUrl = Kustomization.getSourceRefUrl(object);
  const substituteYaml =
    object.spec.postBuild?.substitute && yaml.dump(object.spec.postBuild?.substitute, defaultYamlDumpOptions).trimEnd();

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Condition">
          <Badge className={getConditionClass(object)} label={getConditionText(object)} />
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
          <MaybeLink
            key="link"
            to={getMaybeDetailsUrl(namespacesApi.formatUrlForNotListing({ name: object.spec.targetNamespace }))}
            onClick={stopPropagation}
          >
            {object.spec.targetNamespace}
          </MaybeLink>
        </DrawerItem>
        <DrawerItem name="Prune">
          <BadgeBoolean value={object.spec.prune ?? false} />
        </DrawerItem>
        <DrawerItem name="Timeout" hidden={!object.spec.timeout}>
          {object.spec.timeout}
        </DrawerItem>
        <DrawerItem name="Force">
          <BadgeBoolean value={object.spec.force ?? false} />
        </DrawerItem>
        <DrawerItem name="Service Account" hidden={!object.spec.serviceAccountName}>
          <MaybeLink
            key="link"
            to={getMaybeDetailsUrl(
              serviceAccountsApi.formatUrlForNotListing({ name: object.spec.serviceAccountName, namespace }),
            )}
            onClick={stopPropagation}
          >
            {object.spec.serviceAccountName}
          </MaybeLink>
        </DrawerItem>
        <DrawerItem name="Kube Config" hidden={!object.spec.kubeConfig?.secretRef.name}>
          <MaybeLink
            key="link"
            to={getMaybeDetailsUrl(
              secretsApi.formatUrlForNotListing({ name: object.spec.kubeConfig?.secretRef.name, namespace }),
            )}
            onClick={stopPropagation}
          >
            {object.spec.kubeConfig?.secretRef.name}
          </MaybeLink>
        </DrawerItem>
        <DrawerItem name="Last Applied Revision">{object.status?.lastAppliedRevision}</DrawerItem>
        <DrawerItem name="Suspended">
          <BadgeBoolean value={object.spec.suspend ?? false} />
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
                    <MaybeLink
                      key="link"
                      to={getMaybeDetailsUrl(
                        api.formatUrlForNotListing({
                          name: dependency.name,
                          namespace: dependency.namespace ?? namespace,
                        }),
                      )}
                      onClick={stopPropagation}
                    >
                      {dependency.name}
                    </MaybeLink>
                  </DrawerItem>
                  <DrawerItem name="Namespace">
                    <MaybeLink
                      key="link"
                      to={getMaybeDetailsUrl(
                        namespacesApi.formatUrlForNotListing({
                          name: dependency.namespace ?? namespace,
                        }),
                      )}
                      onClick={stopPropagation}
                    >
                      {dependency.namespace ?? namespace}
                    </MaybeLink>
                  </DrawerItem>
                  <DrawerItem name="Revision" hidden={!reference?.status?.lastAppliedRevision}>
                    {reference?.status?.lastAppliedRevision}
                  </DrawerItem>
                  <DrawerItem name="Status" hidden={!reference}>
                    {reference ? (
                      <Badge className={getConditionClass(reference)} label={getConditionText(reference)} />
                    ) : (
                      ""
                    )}
                  </DrawerItem>
                  <DrawerItem name="Message" hidden={!reference}>
                    {reference && getConditionMessage(reference)}
                  </DrawerItem>
                </div>
              );
            })}
          </div>
        )}

        {object.spec.patches && (
          <div>
            <DrawerTitle>Patches</DrawerTitle>
            {object.spec.patches.map((patch) => {
              const key = crypto
                .createHash("sha256")
                .update(
                  [
                    patch.patch,
                    patch.target?.kind,
                    patch.target?.name,
                    patch.target?.namespace,
                    patch.target?.labelSelector,
                    patch.target?.annotationSelector,
                  ].join(""),
                )
                .digest("hex");

              return (
                <div key={key}>
                  <div className={styles.title}>
                    <Icon small material="list" />
                  </div>
                  <DrawerItem name="Group" hidden={!patch.target?.group}>
                    {patch.target?.group}
                  </DrawerItem>
                  <DrawerItem name="Version" hidden={!patch.target?.version}>
                    {patch.target?.version}
                  </DrawerItem>
                  <DrawerItem name="Kind" hidden={!patch.target?.kind}>
                    {patch.target?.kind}
                  </DrawerItem>
                  <DrawerItem name="Name" hidden={!patch.target?.name}>
                    {patch.target?.name}
                  </DrawerItem>
                  <DrawerItem name="Namespace" hidden={!patch.target?.namespace}>
                    {patch.target?.namespace}
                  </DrawerItem>
                  <DrawerItem name="Label Selector" hidden={!patch.target?.labelSelector}>
                    {patch.target?.labelSelector}
                  </DrawerItem>
                  <DrawerItem name="Annotation Selector" hidden={!patch.target?.annotationSelector}>
                    {patch.target?.annotationSelector}
                  </DrawerItem>
                  <div className="DrawerItem">Patch</div>
                  <MonacoEditor
                    readOnly
                    id={`patch-${key}`}
                    className={styles.editor}
                    style={{
                      minHeight: getHeight(patch.patch),
                    }}
                    value={patch.patch}
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
          </div>
        )}

        {object.spec.patchesStrategicMerge && (
          <div>
            <DrawerTitle>Patches: Strategic Merge</DrawerTitle>
            {object.spec.patchesStrategicMerge.map((patch) => {
              const key = crypto.createHash("sha256").update(patch).digest("hex");

              return (
                <div key={key}>
                  <div className={styles.title}>
                    <Icon small material="list" />
                  </div>
                  <MonacoEditor
                    readOnly
                    id={`patch-${key}`}
                    style={{
                      minHeight: getHeight(patch),
                      resize: "none",
                      overflow: "hidden",
                      border: "1px solid var(--borderFaintColor)",
                      borderRadius: "4px",
                    }}
                    value={patch}
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
          </div>
        )}

        {object.spec.patchesJson6902 && (
          <div>
            <DrawerTitle>Patches: RFC 6902</DrawerTitle>
            {object.spec.patchesJson6902.map((patch) => {
              const patchYaml = yaml.dump(patch.patch, defaultYamlDumpOptions);
              const key = crypto
                .createHash("sha256")
                .update(
                  [
                    patchYaml,
                    patch.target?.kind,
                    patch.target?.name,
                    patch.target?.namespace,
                    patch.target?.labelSelector,
                    patch.target?.annotationSelector,
                  ].join(""),
                )
                .digest("hex");

              return (
                <div key={key}>
                  <div className={styles.title}>
                    <Icon small material="list" />
                  </div>
                  <DrawerItem name="Group" hidden={!patch.target?.group}>
                    {patch.target?.group}
                  </DrawerItem>
                  <DrawerItem name="Version" hidden={!patch.target?.version}>
                    {patch.target?.version}
                  </DrawerItem>
                  <DrawerItem name="Kind" hidden={!patch.target?.kind}>
                    {patch.target?.kind}
                  </DrawerItem>
                  <DrawerItem name="Name" hidden={!patch.target?.name}>
                    {patch.target?.name}
                  </DrawerItem>
                  <DrawerItem name="Namespace" hidden={!patch.target?.namespace}>
                    {patch.target?.namespace}
                  </DrawerItem>
                  <DrawerItem name="Label Selector" hidden={!patch.target?.labelSelector}>
                    {patch.target?.labelSelector}
                  </DrawerItem>
                  <DrawerItem name="Annotation Selector" hidden={!patch.target?.annotationSelector}>
                    {patch.target?.annotationSelector}
                  </DrawerItem>
                  <div className="DrawerItem">Patch</div>
                  <MonacoEditor
                    readOnly
                    id={`patch-${key}`}
                    style={{
                      minHeight: getHeight(patchYaml),
                      resize: "none",
                      overflow: "hidden",
                      border: "1px solid var(--borderFaintColor)",
                      borderRadius: "4px",
                    }}
                    value={patchYaml}
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
          </div>
        )}

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
            <DrawerItem name="Secret Name">
              <MaybeLink
                key="link"
                to={getMaybeDetailsUrl(
                  secretsApi.formatUrlForNotListing({ name: object.spec.decryption.secretRef.name, namespace }),
                )}
                onClick={stopPropagation}
              >
                {object.spec.decryption.secretRef.name}
              </MaybeLink>
            </DrawerItem>
          </div>
        )}

        {object.spec.healthChecks && (
          <div className="KustomizationHealthChecks flex column">
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
                    <WithTooltip tooltip={inventoryKindTooltip(healthCheck)}>{healthCheck.kind}</WithTooltip>
                  </TableCell>
                  <TableCell className={styles.name}>
                    <MaybeLink to={getMaybeDetailsUrl(getRefUrl(healthCheck))} onClick={stopPropagation}>
                      <WithTooltip>{healthCheck.name}</WithTooltip>
                    </MaybeLink>
                  </TableCell>
                  <TableCell className={styles.namespace}>
                    <MaybeLink
                      key="link"
                      to={getMaybeDetailsUrl(
                        namespacesApi.formatUrlForNotListing({
                          name: healthCheck.namespace ?? namespace,
                        }),
                      )}
                      onClick={stopPropagation}
                    >
                      <WithTooltip>{healthCheck.namespace ?? namespace}</WithTooltip>
                    </MaybeLink>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        )}

        {object.status?.inventory?.entries && (
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
              {object.status.inventory?.entries.map((inventoryResourceRef) => {
                const objectRef = inventoryResourceRefToObjectRef(inventoryResourceRef);
                if (!objectRef) return null;
                return (
                  <TableRow key={inventoryResourceRef.id} sortItem={objectRef} nowrap>
                    <TableCell className={styles.kind}>
                      <WithTooltip tooltip={inventoryKindTooltip(objectRef)}>{objectRef.kind}</WithTooltip>
                    </TableCell>
                    <TableCell className={styles.name}>
                      <MaybeLink to={getMaybeDetailsUrl(getRefUrl(objectRef))} onClick={stopPropagation}>
                        <WithTooltip>{objectRef.name}</WithTooltip>
                      </MaybeLink>
                    </TableCell>
                    <TableCell className={styles.namespace}>
                      <MaybeLink
                        key="link"
                        to={getMaybeDetailsUrl(
                          namespacesApi.formatUrlForNotListing({
                            name: objectRef.namespace ?? namespace,
                          }),
                        )}
                        onClick={stopPropagation}
                      >
                        <WithTooltip>{objectRef.namespace ?? namespace}</WithTooltip>
                      </MaybeLink>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </div>
        )}
      </div>
    </>
  );
};
