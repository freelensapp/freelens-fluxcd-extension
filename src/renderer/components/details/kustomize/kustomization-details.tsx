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
import { NamespacedObjectKindReference } from "../../../k8s/fluxcd/types";
import {
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
    Tooltip,
  },
  K8sApi: { configMapApi, namespacesApi, secretsApi, serviceAccountsApi },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

export function getSourceRefText(object: Kustomization): string {
  return [
    object.spec.sourceRef.kind,
    ": ",
    object.spec.sourceRef.namespace ? `${object.spec.sourceRef.namespace}/` : "",
    object.spec.sourceRef.name,
  ].join("");
}

export function getSourceRefUrl(object: Kustomization): string | undefined {
  const ref = object.spec.sourceRef;
  if (!ref) return;
  return Renderer.K8sApi.apiManager.lookupApiLink(ref, object);
}

export const KustomizationDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Kustomization>> = (props) => {
  const { object } = props;
  const namespace = object.getNs();
  const api = Kustomization.getApi() as KustomizationApi;
  const store = Kustomization.getStore() as KustomizationStore;

  const [substituteFromYaml, setSubstituteFromYaml] = useState<Record<string, string>>({});

  const getRefUrl = (ref: NamespacedObjectKindReference) => {
    if (!ref) return;
    return Renderer.K8sApi.apiManager.lookupApiLink(ref, object);
  };

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

  const sourceRefUrl = getSourceRefUrl(object);
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
            {getSourceRefText(object)}
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

        {object.spec.healthChecks && (
          <div className="KustomizationHealthChecks flex column">
            <DrawerTitle>Health Checks</DrawerTitle>
            <Table
              selectable
              tableId="healthChecks"
              scrollable={false}
              sortable={{
                apiVersion: (reference: NamespacedObjectKindReference) => reference.apiVersion,
                kind: (reference: NamespacedObjectKindReference) => reference.kind,
                name: (reference: NamespacedObjectKindReference) => reference.name,
                namespace: (reference: NamespacedObjectKindReference) => reference.namespace,
              }}
              sortByDefault={{ sortBy: "name", orderBy: "asc" }}
              sortSyncWithUrl={false}
              className="box grow"
            >
              <TableHead flat sticky={false}>
                <TableCell className="apiVersion" sortBy="apiVersion">
                  API Version
                </TableCell>
                <TableCell className="kind" sortBy="kind">
                  Kind
                </TableCell>
                <TableCell className="name" sortBy="name">
                  Name
                </TableCell>
                <TableCell className="appVersion" sortBy="namespace">
                  Namespace
                </TableCell>
              </TableHead>
              {object.spec.healthChecks.map((healthCheck) => (
                <TableRow key={`${healthCheck.namespace}-${healthCheck.name}`} sortItem={healthCheck} nowrap>
                  <TableCell className="apiVersion">
                    <span id={`kustomizationHealthChecks-${healthCheck.name}-apiVersion`}>
                      {healthCheck.apiVersion}
                    </span>
                    <Tooltip targetId={`kustomizationHealthChecks-${healthCheck.name}-apiVersion`}>
                      {healthCheck.apiVersion}
                    </Tooltip>
                  </TableCell>
                  <TableCell className="kind">
                    <span id={`kustomizationHealthChecks-${healthCheck.name}-kind`}>{healthCheck.kind}</span>
                    <Tooltip targetId={`kustomizationHealthChecks-${healthCheck.name}-kind`}>
                      {healthCheck.kind}
                    </Tooltip>
                  </TableCell>
                  <TableCell className="name" id={`kustomizationHealthChecks-${healthCheck.name}-name`}>
                    <MaybeLink to={getMaybeDetailsUrl(getRefUrl(healthCheck))} onClick={stopPropagation}>
                      {healthCheck.name}
                    </MaybeLink>
                    <Tooltip targetId={`kustomizationHealthChecks-${healthCheck.name}-name`}>
                      {healthCheck.name}
                    </Tooltip>
                  </TableCell>
                  <TableCell className="namespace" id={`kustomizationHealthChecks-${healthCheck.namespace}-namespace`}>
                    <MaybeLink
                      key="link"
                      to={getMaybeDetailsUrl(
                        namespacesApi.formatUrlForNotListing({
                          name: healthCheck.namespace ?? namespace,
                        }),
                      )}
                      onClick={stopPropagation}
                    >
                      {healthCheck.namespace ?? namespace}
                    </MaybeLink>
                    <Tooltip targetId={`kustomizationHealthChecks-${healthCheck.namespace}-namespace`}>
                      {healthCheck.namespace ?? namespace}
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        )}

        {object.spec.dependsOn && (
          <div className="KustomizationDependsOn">
            <DrawerTitle>Depends On</DrawerTitle>
            {object.spec.dependsOn.map((dependency) => {
              const reference = store.getByName(dependency.name, dependency.namespace ?? namespace);
              return (
                <div className="dependency" key={dependency.name + (dependency.namespace ?? "")}>
                  <div className="title flex gaps">
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
          <div className="KustomizationPatches">
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
                <div key={key} className="patch">
                  <div className="title flex gaps">
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
                  <div className="DrawerItem">
                    <span className="name">Patch</span>
                  </div>
                  <div className="flex column gaps editor">
                    <MonacoEditor
                      readOnly
                      id={`patch-${key}`}
                      style={{
                        minHeight: getHeight(patch.patch),
                        resize: "none",
                        overflow: "hidden",
                        border: "1px solid var(--borderFaintColor)",
                        borderRadius: "4px",
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
                </div>
              );
            })}
          </div>
        )}

        {object.spec.patchesStrategicMerge && (
          <div className="KustomizationPatchesStrategicMerge">
            <DrawerTitle>Patches: Strategic Merge</DrawerTitle>
            {object.spec.patchesStrategicMerge.map((patch) => {
              const key = crypto.createHash("sha256").update(patch).digest("hex");

              return (
                <div key={key} className="patch">
                  <div className="title flex gaps">
                    <Icon small material="list" />
                  </div>
                  <div className="flex column gaps">
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
                </div>
              );
            })}
          </div>
        )}

        {object.spec.patchesJson6902 && (
          <div className="KustomizationPatchesJson6902">
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
                <div key={key} className="patch">
                  <div className="title flex gaps">
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
                  <div className="DrawerItem">
                    <span className="name">Patch</span>
                  </div>
                  <div className="flex column gaps">
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
                </div>
              );
            })}
          </div>
        )}

        {object.spec.images && (
          <div className="KustomizationImages">
            <DrawerTitle>Images</DrawerTitle>
            {object.spec.images.map((image) => {
              return (
                <div className="image" key={image.name}>
                  <div className="title flex gaps">
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
          <div className={styles.kustomizationSubstitute}>
            <DrawerTitle>Post Build Variable Substitution</DrawerTitle>
            {object.spec.postBuild.substituteFrom?.map((substituteFrom) => {
              const api = substituteFrom.kind.toLowerCase() === "secret" ? secretsApi : configMapApi;
              const name = substituteFrom.name;
              const substituteFromYamlValue = substituteFromYaml[`${namespace}/${name}`] ?? "";

              return (
                <div key={name} className="variablesFrom">
                  <div className="title flex gaps">
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
                  <div>
                    <div className="DrawerItem">
                      <span className="name">Variables</span>
                    </div>
                    <div className="flex column gaps">
                      <MonacoEditor
                        readOnly
                        id={`variablesFromYaml-${namespace}-${name}`}
                        style={{
                          minHeight: getHeight(substituteFromYamlValue),
                          resize: "none",
                          overflow: "hidden",
                          border: "1px solid var(--borderFaintColor)",
                          borderRadius: "4px",
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
                  </div>
                </div>
              );
            })}
            {substituteYaml && (
              <>
                <div className="title flex gaps">
                  <Icon small material="list" />
                </div>
                <div className="DrawerItem">
                  <span className="name">Variables</span>
                </div>
                <div className="flex column gaps">
                  <MonacoEditor
                    readOnly
                    id={`substituteYaml-${namespace}`}
                    style={{
                      minHeight: getHeight(substituteYaml),
                      resize: "none",
                      overflow: "hidden",
                      border: "1px solid var(--borderFaintColor)",
                      borderRadius: "4px",
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
              </>
            )}
          </div>
        )}

        {object.spec.decryption && (
          <div className="KustomizationDecryption">
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
      </div>
    </>
  );
};
