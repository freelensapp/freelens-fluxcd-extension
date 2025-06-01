import { Common, Renderer } from "@freelensapp/extensions";
import React from "react";
import { Link } from "react-router-dom";
import { Condition } from "../../k8s/core/types";
import { Kustomization } from "../../k8s/fluxcd/kustomization";
import { NamespacedObjectKindReference } from "../../k8s/fluxcd/types";
import { getStatusClass, getStatusText, lowerAndPluralize } from "../../utils";

const {
  Component: { Badge, DrawerItem, DrawerTitle, Table, TableCell, TableHead, TableRow, Tooltip },
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
              {object.spec?.healthChecks?.map((reference) => (
                <TableRow key={`${reference.namespace}-${reference.name}`} sortItem={reference} nowrap>
                  <TableCell className="apiVersion">
                    <span id={`kustomizationHealthChecks-${reference.name}-apiVersion`}>{reference.apiVersion}</span>
                    <Tooltip targetId={`kustomizationHealthChecks-${reference.name}-apiVersion`}>
                      {reference.apiVersion}
                    </Tooltip>
                  </TableCell>
                  <TableCell className="kind">
                    <span id={`kustomizationHealthChecks-${reference.name}-kind`}>{reference.kind}</span>
                    <Tooltip targetId={`kustomizationHealthChecks-${reference.name}-kind`}>{reference.kind}</Tooltip>
                  </TableCell>
                  <TableCell className="name" id={`kustomizationHealthChecks-${reference.name}-name`}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        Renderer.Navigation.showDetails(
                          `/apis/${reference.apiVersion}/namespaces/${reference.namespace ?? object.metadata.namespace}/${lowerAndPluralize(reference.kind)}/${reference.name}`,
                          true,
                        );
                      }}
                    >
                      {reference.name}
                    </a>
                    <Tooltip targetId={`kustomizationHealthChecks-${reference.name}-name`}>{reference.name}</Tooltip>
                  </TableCell>
                  <TableCell className="namespace" id={`kustomizationHealthChecks-${reference.namespace}-namespace`}>
                    <Link
                      key="link"
                      to={getDetailsUrl(
                        namespacesApi.formatUrlForNotListing({
                          name: reference.namespace ?? object.metadata.namespace,
                        }),
                      )}
                      onClick={stopPropagation}
                    >
                      {reference.namespace ?? object.metadata.namespace}
                    </Link>
                    <Tooltip targetId={`kustomizationHealthChecks-${reference.namespace}-namespace`}>
                      {reference.namespace ?? object.metadata.namespace}
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        )}
      </div>
    );
  }
}
