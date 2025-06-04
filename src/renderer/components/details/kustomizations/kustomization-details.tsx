import crypto from "crypto";
import { Common, Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import React from "react";
import { Link } from "react-router-dom";
import { Condition } from "../../../k8s/core/types";
import { Kustomization, kustomizationApi, kustomizationStore } from "../../../k8s/fluxcd/kustomization";
import { NamespacedObjectKindReference } from "../../../k8s/fluxcd/types";
import {
  defaultYamlDumpOptions,
  getHeight,
  getStatusClass,
  getStatusMessage,
  getStatusText,
  lowerAndPluralize,
} from "../../../utils";

import { Base64 } from "js-base64";
import { crdStore } from "../../../k8s/core/crd";
import styleInline from "./kustomization-details.scss?inline";

const {
  Component: { Badge, DrawerItem, DrawerTitle, Icon, MonacoEditor, Table, TableCell, TableHead, TableRow, Tooltip },
  K8sApi: { configMapApi, namespacesApi, secretsApi, serviceAccountsApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

interface KustomizationDetailsState {
  crds: Renderer.K8sApi.CustomResourceDefinition[];
  substituteFromYaml: Record<string, string>;
}

enum healthChecksSortBy {
  apiVersion = "apiVersion",
  kind = "kind",
  name = "name",
  namespace = "namespace",
}

export class FluxCDKustomizationDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<Kustomization>,
  KustomizationDetailsState
> {
  public readonly state: Readonly<KustomizationDetailsState> = {
    crds: [],
    substituteFromYaml: {},
  };

  getCrd(kind?: string): Renderer.K8sApi.CustomResourceDefinition | null {
    const { crds } = this.state;

    if (!kind) {
      return null;
    }

    if (!crds) {
      return null;
    }

    return crds.find((crd) => crd.spec.names.kind === kind) ?? null;
  }

  sourceUrl(resource: Kustomization): string {
    const name = resource.spec.sourceRef.name;
    const namespace = resource.spec.sourceRef.namespace ?? resource.getNs()!;
    const kind = lowerAndPluralize(resource.spec.sourceRef.kind);
    const crd = this.getCrd(kind);
    const apiVersion = crd?.spec.versions?.find((v: any) => v.storage === true)?.name;
    const group = crd?.spec.group;

    if (!apiVersion || !group) return "";

    return `/apis/${group}/${apiVersion}/namespaces/${namespace}/${kind}/${name}`;
  }

  async componentDidMount() {
    crdStore.loadAll().then((l) => this.setState({ crds: l! }));

    const { object } = this.props;
    const namespace = object.metadata.namespace!;

    const substituteFromYaml: typeof this.state.substituteFromYaml = {};

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
      substituteFromYaml[`${namespace}/${name}`] = yaml.dump(variablesFrom, defaultYamlDumpOptions).trimEnd();
    }

    this.setState({ substituteFromYaml });
  }

  render() {
    const { object } = this.props;
    const namespace = object.getNs();

    const substituteYaml =
      object.spec.postBuild?.substitute &&
      yaml.dump(object.spec.postBuild?.substitute, defaultYamlDumpOptions).trimEnd();

    return (
      <>
        <style>{styleInline}</style>
        <div className="KustomizationDetails">
          <DrawerItem name="Status">
            <Badge className={getStatusClass(object)} label={getStatusText(object)} />
          </DrawerItem>
          <DrawerItem name="Message">
            {object.status?.conditions?.find((s: Condition) => s.type === "Ready")?.message}
          </DrawerItem>
          <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
          <DrawerItem name="Retry Interval" hidden={!object.spec.retryInterval}>
            {object.spec.retryInterval}
          </DrawerItem>
          <DrawerItem name="Path" hidden={!object.spec.path}>
            {object.spec.path}
          </DrawerItem>
          <DrawerItem name="Source">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                Renderer.Navigation.showDetails(this.sourceUrl(object), true);
              }}
            >
              {object.spec.sourceRef.kind}
              {": "}
              {object.spec.sourceRef.namespace ? `${object.spec.sourceRef.namespace}/` : ""}
              {object.spec.sourceRef.name}
            </a>
          </DrawerItem>
          <DrawerItem name="Target Namespace" hidden={!object.spec.targetNamespace}>
            <Link
              key="link"
              to={getDetailsUrl(namespacesApi.formatUrlForNotListing({ name: object.spec.targetNamespace }))}
              onClick={stopPropagation}
            >
              {object.spec.targetNamespace}
            </Link>
          </DrawerItem>
          <DrawerItem name="Prune">{object.spec.prune === true ? "Yes" : "No"}</DrawerItem>
          <DrawerItem name="Suspended">{object.spec.suspend === true ? "Yes" : "No"}</DrawerItem>
          <DrawerItem name="Timeout" hidden={!object.spec.timeout}>
            {object.spec.timeout}
          </DrawerItem>
          <DrawerItem name="Force">{object.spec.force === true ? "Yes" : "No"}</DrawerItem>
          <DrawerItem name="Service Account" hidden={!object.spec.serviceAccountName}>
            <Link
              key="link"
              to={getDetailsUrl(
                serviceAccountsApi.formatUrlForNotListing({ name: object.spec.serviceAccountName, namespace }),
              )}
              onClick={stopPropagation}
            >
              {object.spec.serviceAccountName}
            </Link>
          </DrawerItem>
          <DrawerItem name="Last Applied Revision">{object.status?.lastAppliedRevision}</DrawerItem>

          {object.spec.healthChecks && (
            <div className="KustomizationHealthChecks flex column">
              <DrawerTitle>Health Checks</DrawerTitle>
              <Table
                selectable
                tableId="healthChecks"
                scrollable={false}
                sortable={{
                  [healthChecksSortBy.apiVersion]: (reference: NamespacedObjectKindReference) => reference.apiVersion,
                  [healthChecksSortBy.kind]: (reference: NamespacedObjectKindReference) => reference.kind,
                  [healthChecksSortBy.name]: (reference: NamespacedObjectKindReference) => reference.name,
                  [healthChecksSortBy.namespace]: (reference: NamespacedObjectKindReference) => reference.namespace,
                }}
                sortByDefault={{ sortBy: healthChecksSortBy.name, orderBy: "asc" }}
                sortSyncWithUrl={false}
                className="box grow"
              >
                <TableHead flat sticky={false}>
                  <TableCell className="apiVersion" sortBy={healthChecksSortBy.apiVersion}>
                    API Version
                  </TableCell>
                  <TableCell className="kind" sortBy={healthChecksSortBy.kind}>
                    Kind
                  </TableCell>
                  <TableCell className="name" sortBy={healthChecksSortBy.name}>
                    Name
                  </TableCell>
                  <TableCell className="appVersion" sortBy={healthChecksSortBy.namespace}>
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
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          Renderer.Navigation.showDetails(
                            `/apis/${healthCheck.apiVersion}/namespaces/${healthCheck.namespace ?? namespace}/${lowerAndPluralize(healthCheck.kind)}/${healthCheck.name}`,
                            true,
                          );
                        }}
                      >
                        {healthCheck.name}
                      </a>
                      <Tooltip targetId={`kustomizationHealthChecks-${healthCheck.name}-name`}>
                        {healthCheck.name}
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      className="namespace"
                      id={`kustomizationHealthChecks-${healthCheck.namespace}-namespace`}
                    >
                      <Link
                        key="link"
                        to={getDetailsUrl(
                          namespacesApi.formatUrlForNotListing({
                            name: healthCheck.namespace ?? namespace,
                          }),
                        )}
                        onClick={stopPropagation}
                      >
                        {healthCheck.namespace ?? namespace}
                      </Link>
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
                const reference = kustomizationStore.getByName(dependency.name);
                return (
                  <div className="dependency">
                    <div className="title flex gaps">
                      <Icon small material="list" />
                    </div>

                    <DrawerItem name="Name">
                      <Link
                        key="link"
                        to={getDetailsUrl(
                          kustomizationApi.formatUrlForNotListing({
                            name: dependency.name,
                            namespace: dependency.namespace ?? namespace,
                          }),
                        )}
                        onClick={stopPropagation}
                      >
                        {dependency.name}
                      </Link>
                    </DrawerItem>
                    <DrawerItem name="Namespace">
                      <Link
                        key="link"
                        to={getDetailsUrl(
                          namespacesApi.formatUrlForNotListing({
                            name: dependency.namespace ?? namespace,
                          }),
                        )}
                        onClick={stopPropagation}
                      >
                        {dependency.namespace ?? namespace}
                      </Link>
                    </DrawerItem>
                    <DrawerItem name="Revision" hidden={!reference?.status?.lastAppliedRevision}>
                      {reference?.status?.lastAppliedRevision}
                    </DrawerItem>
                    <DrawerItem name="Status" hidden={!reference}>
                      {reference ? (
                        <Badge className={getStatusClass(reference)} label={getStatusText(reference)} />
                      ) : (
                        ""
                      )}
                    </DrawerItem>
                    <DrawerItem name="Message" hidden={!reference}>
                      {reference && getStatusMessage(reference)}
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
                  <div className="image">
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
            <div className="KustomizationSubstitute flex column">
              <DrawerTitle>Post Build Variable Substitution</DrawerTitle>
              {object.spec.postBuild.substituteFrom?.map((substituteFrom) => {
                const api = substituteFrom.kind.toLowerCase() === "secret" ? secretsApi : configMapApi;
                const name = substituteFrom.name;
                const substituteFromYaml = this.state.substituteFromYaml[`${namespace}/${name}`] ?? "";

                return (
                  <div key={name} className="variablesFrom">
                    <div className="title flex gaps">
                      <Icon small material="list" />
                    </div>
                    <DrawerItem name="Kind">{substituteFrom.kind}</DrawerItem>
                    <DrawerItem name="Name">
                      <Link
                        key="link"
                        to={getDetailsUrl(api.formatUrlForNotListing({ name, namespace }))}
                        onClick={stopPropagation}
                      >
                        {name}
                      </Link>
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
                            minHeight: getHeight(substituteFromYaml),
                            resize: "none",
                            overflow: "hidden",
                            border: "1px solid var(--borderFaintColor)",
                            borderRadius: "4px",
                          }}
                          value={substituteFromYaml}
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
                      id={`substituteYaml-${namespace}-${name}`}
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
        </div>
      </>
    );
  }
}
