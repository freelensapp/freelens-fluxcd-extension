import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { Provider } from "../../../k8s/fluxcd/notification/provider";

interface ProviderDetailsState {
  events: Renderer.K8sApi.KubeEvent[];
  crds: Renderer.K8sApi.CustomResourceDefinition[];
}

const {
  Component: { DrawerItem },
} = Renderer;

export class FluxCDProviderDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<Provider>,
  ProviderDetailsState
> {
  public readonly state: Readonly<ProviderDetailsState> = {
    events: [],
    crds: [],
  };

  getCrd(kind?: string): Renderer.K8sApi.CustomResourceDefinition | undefined {
    const { crds } = this.state;

    if (!kind || !crds) return;

    return crds.find((crd) => crd.spec.names.kind === kind);
  }

  sourceUrl(resource: Provider) {
    const name = resource.spec.secretRef.name;
    const ns = resource.spec.secretRef.namespace ?? resource.metadata.namespace;

    const url = `/api/v1/namespaces/${ns}/secrets/${name}`;

    return url;
  }

  async componentDidMount() {
    const crdStore = Renderer.K8sApi.crdStore;
    if (crdStore) {
      crdStore.loadAll().then((l) => this.setState({ crds: l! }));
    }
  }

  render() {
    const { object } = this.props;

    return (
      <div>
        <DrawerItem name="Type">{object.spec.type}</DrawerItem>
        <DrawerItem name="Suspended">{object.spec.suspend === true ? "Yes" : "No"}</DrawerItem>

        <DrawerItem name="Resources">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              Renderer.Navigation.showDetails(this.sourceUrl(object), true);
            }}
          >
            Secret:{object.spec.secretRef.name}
          </a>
        </DrawerItem>
      </div>
    );
  }
}
