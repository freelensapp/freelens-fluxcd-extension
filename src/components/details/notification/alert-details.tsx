import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { crdStore } from "../../../k8s/core/crd";
import { Alert } from "../../../k8s/fluxcd/notifications/alert";
import { lowerAndPluralize } from "../../../utils";

interface AlertDetailsState {
  events: Renderer.K8sApi.KubeEvent[];
  crds: Renderer.K8sApi.CustomResourceDefinition[];
}

const {
  Component: { DrawerItem, Badge },
} = Renderer;

export class FluxCDAlertDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<Alert>,
  AlertDetailsState
> {
  public readonly state: Readonly<AlertDetailsState> = {
    events: [],
    crds: [],
  };

  getCrd(kind: string): Renderer.K8sApi.CustomResourceDefinition {
    const { crds } = this.state;

    if (!kind) {
      return null;
    }

    if (!crds) {
      return null;
    }

    return crds.find((crd) => crd.spec.names.kind === kind);
  }

  sourceUrl(resource: any, overwriteKind: string = null) {
    const name = resource.name;
    const ns = resource.namespace ?? this.props.object.metadata.namespace;
    const resourceKind = overwriteKind ?? resource.kind;
    const kind = lowerAndPluralize(resourceKind);
    const crd = this.getCrd(resourceKind);
    const apiVersion = crd?.spec.versions?.find((v: any) => v.storage === true)?.name;
    const group = crd?.spec.group;

    if (!apiVersion || !group) return "";

    return `/apis/${group}/${apiVersion}/namespaces/${ns}/${kind}/${name}`;
  }

  async componentDidMount() {
    crdStore.loadAll().then((l: any) => this.setState({ crds: l as Renderer.K8sApi.CustomResourceDefinition[] }));
  }

  render() {
    const { object } = this.props;

    return (
      <div>
        <DrawerItem name="Event Severity">{object.spec.eventSeverity}</DrawerItem>
        <DrawerItem name="Suspended">{object.spec.suspend === true ? "Yes" : "No"}</DrawerItem>
        <DrawerItem name="Provider">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              Renderer.Navigation.showDetails(this.sourceUrl(object.spec.providerRef, "Provider"), true);
            }}
          >
            Provider:{object.spec.providerRef.name}
          </a>
        </DrawerItem>
        <DrawerItem name="Resources">
          {object.spec.eventSources.map((eventSource, index: number) => (
            <li key={index}>
              {eventSource.name === "*" ? (
                <Badge label={`${eventSource.kind}:${eventSource.name}`} />
              ) : (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    Renderer.Navigation.showDetails(this.sourceUrl(eventSource), true);
                  }}
                >
                  {eventSource.kind}:{eventSource.name}
                </a>
              )}
            </li>
          ))}
        </DrawerItem>
      </div>
    );
  }
}
