import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { crdStore } from "../../../k8s/core/crd";
import { ImageUpdateAutomation } from "../../../k8s/fluxcd/image-automation/imageupdateautomation";
import { lowerAndPluralize } from "../../../utils";

const {
  Component: { DrawerItem },
} = Renderer;

interface ImageUpdateAutomationDetailsState {
  crds: Renderer.K8sApi.CustomResourceDefinition[];
}

export class FluxCDImageUpdateAutomationDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<ImageUpdateAutomation>,
  ImageUpdateAutomationDetailsState
> {
  public readonly state: Readonly<ImageUpdateAutomationDetailsState> = {
    crds: [],
  };

  getCrd(kind: string): Renderer.K8sApi.CustomResourceDefinition | null {
    const { crds } = this.state;

    if (!kind) {
      return null;
    }

    if (!crds) {
      return null;
    }

    return crds.find((crd) => crd.spec.names.kind === kind) ?? null;
  }

  sourceUrl(resource: ImageUpdateAutomation): string {
    const name = resource.spec.sourceRef.name;
    const ns = resource.spec.sourceRef.namespace ?? resource.metadata.namespace;
    const kind = lowerAndPluralize(resource.spec.sourceRef.kind);
    const crd = this.getCrd(resource.spec.sourceRef.kind);
    const apiVersion = crd?.spec.versions?.find((v: any) => v.storage === true)?.name;
    const group = crd?.spec.group;

    if (!apiVersion || !group) return "";

    return `/apis/${group}/${apiVersion}/namespaces/${ns}/${kind}/${name}`;
  }

  async componentDidMount() {
    crdStore.loadAll().then((l) => this.setState({ crds: l as Renderer.K8sApi.CustomResourceDefinition[] }));
  }

  render() {
    const { object } = this.props;

    return (
      <div>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
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
