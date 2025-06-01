import { Common, Renderer } from "@freelensapp/extensions";
import React from "react";
import { Link } from "react-router-dom";
import { Condition } from "../../k8s/core/types";
import { Kustomization, kustomizationApi, kustomizationStore } from "../../k8s/fluxcd/kustomization";
import { NamespacedObjectKindReference } from "../../k8s/fluxcd/types";
import { getStatusClass, getStatusMessage, getStatusText, lowerAndPluralize } from "../../utils";

const {
  Component: { Badge, DrawerItem, DrawerTitle, Icon, Table, TableCell, TableHead, TableRow, Tooltip },
  K8sApi: { namespacesApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

enum healthChecksSortBy {
  apiVersion = "apiVersion",
  kind = "kind",
  name = "name",
  namespace = "namespace",
}

export class FluxCDKustomizationDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<Kustomization>
> {
  sourceUrl(object: Kustomization) {
    const name = object.spec.sourceRef.name;
    const ns = object.spec.sourceRef.namespace ?? object.metadata.namespace;
    const kind = lowerAndPluralize(object.spec.sourceRef.kind);
    const apiVersion =
      kind === "ocirepositories" ? "source.toolkit.fluxcd.io/v1beta2" : "source.toolkit.fluxcd.io/v1beta1";

    return `/apis/${apiVersion}/namespaces/${ns}/${kind}/${name}`;
  }

  render() {
    const { object } = this.props;

    return (
      <div>
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
                          `/apis/${healthCheck.apiVersion}/namespaces/${healthCheck.namespace ?? object.metadata.namespace}/${lowerAndPluralize(healthCheck.kind)}/${healthCheck.name}`,
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
                  <TableCell className="namespace" id={`kustomizationHealthChecks-${healthCheck.namespace}-namespace`}>
                    <Link
                      key="link"
                      to={getDetailsUrl(
                        namespacesApi.formatUrlForNotListing({
                          name: healthCheck.namespace ?? object.metadata.namespace,
                        }),
                      )}
                      onClick={stopPropagation}
                    >
                      {healthCheck.namespace ?? object.metadata.namespace}
                    </Link>
                    <Tooltip targetId={`kustomizationHealthChecks-${healthCheck.namespace}-namespace`}>
                      {healthCheck.namespace ?? object.metadata.namespace}
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
                          namespace: dependency.namespace ?? object.metadata.namespace,
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
                          name: dependency.namespace ?? object.metadata.namespace,
                        }),
                      )}
                      onClick={stopPropagation}
                    >
                      {dependency.namespace ?? object.metadata.namespace}
                    </Link>
                  </DrawerItem>
                  <DrawerItem name="Revision" hidden={!reference?.status?.lastAppliedRevision}>
                    {reference?.status?.lastAppliedRevision}
                  </DrawerItem>
                  <DrawerItem name="Status" hidden={!reference}>
                    {reference ? <Badge className={getStatusClass(reference)} label={getStatusText(reference)} /> : ""}
                  </DrawerItem>
                  <DrawerItem name="Message" hidden={!reference}>
                    {reference && getStatusMessage(reference)}
                  </DrawerItem>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
