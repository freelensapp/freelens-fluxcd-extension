import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { Kustomization } from "../../k8s/fluxcd/kustomization";
import { getStatusClass, getStatusText, lowerAndPluralize } from "../../utils";

const {
  Component: { DrawerItem, Badge },
} = Renderer;

export class FluxCDKustomizationDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<Kustomization>
> {
  sourceUrl(object: Kustomization) {
    const name = object.spec.sourceRef.name;
    const ns = object.spec.sourceRef.namespace ?? object.metadata.namespace;
    const kind = lowerAndPluralize(object.spec.sourceRef.kind);

    return `/apis/source.toolkit.fluxcd.io/v1beta1/namespaces/${ns}/${kind}/${name}`;
  }

  render() {
    const { object } = this.props;

    return (
      <div>
        <DrawerItem name="Status">{object.status?.conditions?.find((s: any) => s.type === "Ready").message}</DrawerItem>
        <DrawerItem name="Ready">
          <Badge className={getStatusClass(object)} label={getStatusText(object)} />
        </DrawerItem>
        <DrawerItem name="UID">{object.metadata.uid}</DrawerItem>
        <DrawerItem name="Version">{object.metadata.resourceVersion}</DrawerItem>
        <DrawerItem name="Path">{object.spec.path}</DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        <DrawerItem name="Timeout">{object.spec.timeout}</DrawerItem>
        <DrawerItem name="Suspended">{object.spec.suspend === true ? "Yes" : "No"}</DrawerItem>
        <DrawerItem name="Prune">{object.spec.prune === true ? "Yes" : "No"}</DrawerItem>
        <DrawerItem name="Force">{object.spec.force === true ? "Yes" : "No"}</DrawerItem>
        <DrawerItem name="Last Applied Revision">{object.status.lastAppliedRevision}</DrawerItem>

        <DrawerItem name="Source">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              Renderer.Navigation.showDetails(this.sourceUrl(object), true);
            }}
          >
            {object.spec.sourceRef.kind}:{object.spec.sourceRef.name}
          </a>
        </DrawerItem>
      </div>
    );
  }
}
