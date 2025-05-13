import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { crdStore } from "../../../k8s/core/crd";
import { ImagePolicy } from "../../../k8s/fluxcd/image-automation/imagepolicy";
import { lowerAndPluralize } from "../../../utils";

const {
  Component: { DrawerItem },
} = Renderer;

interface ImagePolicyDetailsState {
  crds: Renderer.K8sApi.CustomResourceDefinition[];
}

export class FluxCDImagePolicyDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<ImagePolicy>,
  ImagePolicyDetailsState
> {
  public readonly state: Readonly<ImagePolicyDetailsState> = {
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

  sourceUrl(resource: ImagePolicy): string {
    const name = resource.spec.imageRepositoryRef.name;
    const ns = resource.spec.imageRepositoryRef.namespace ?? resource.metadata.namespace;
    const kind = lowerAndPluralize("ImageRepository");
    const crd = this.getCrd("ImageRepository");
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
        <DrawerItem name="Source">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              Renderer.Navigation.showDetails(this.sourceUrl(object), true);
            }}
          >
            ImageRepository:{object.spec.imageRepositoryRef.name}
          </a>
        </DrawerItem>
      </div>
    );
  }
}
