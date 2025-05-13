import { Renderer } from "@freelensapp/extensions";

import { observer } from "mobx-react";

import React from "react";

import { KubeAge } from "../../components/ui/kube-age";
import { Provider, providerStore } from "../../k8s/fluxcd/notifications/provider";
import { getStatusClass, getStatusMessage, getStatusText } from "../../utils";

const {
  Component: { KubeObjectListLayout, Badge },
} = Renderer;

enum sortBy {
  name = "name",
  namespace = "namespace",
  status = "status",
  ready = "ready",
  age = "age",
  type = "type",
}

@observer
export class FluxCDProviders extends React.Component<{ extension: Renderer.LensExtension }> {
  render() {
    return (
      <KubeObjectListLayout
        tableId="providersTable"
        className="Providers"
        store={providerStore}
        sortingCallbacks={{
          [sortBy.name]: (provider: Provider) => provider.getName(),
          [sortBy.namespace]: (provider: Provider) => provider.getNs(),
          [sortBy.type]: (provider: Provider) => provider.spec.type,
          [sortBy.ready]: (provider: Provider) => getStatusText(provider),
          [sortBy.status]: (provider: Provider) => getStatusMessage(provider),
          [sortBy.age]: (provider: Provider) => provider.getCreationTimestamp(),
        }}
        searchFilters={[(provider: Provider) => provider.getSearchFields()]}
        renderHeaderTitle="Providers"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Type", className: "type", sortBy: sortBy.type },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(provider: Provider) => [
          provider.getName(),
          provider.getNs(),
          provider.spec.type,
          this.renderStatus(provider),
          getStatusMessage(provider),
          <KubeAge timestamp={provider.getCreationTimestamp()} key="age" />,
        ]}
      />
    );
  }

  renderStatus(provider: Provider) {
    const className = getStatusClass(provider);
    const text = getStatusText(provider);
    return <Badge key="name" label={text} className={className} />;
  }
}
