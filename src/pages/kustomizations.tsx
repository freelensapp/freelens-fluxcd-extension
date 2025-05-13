import { Renderer } from "@freelensapp/extensions";

import { observer } from "mobx-react";

import React from "react";

import { KubeAge } from "../components/ui/kube-age";
import { Kustomization, kustomizationStore } from "../k8s/fluxcd/kustomization";
import { getStatusClass, getStatusMessage, getStatusText } from "../utils";

const {
  Component: { KubeObjectListLayout, Badge },
} = Renderer;

enum sortBy {
  name = "name",
  namespace = "namespace",
  status = "status",
  ready = "ready",
  age = "age",
}

@observer
export class FluxCDKustomizations extends React.Component<{ extension: Renderer.LensExtension }> {
  render() {
    return (
      <KubeObjectListLayout
        tableId="kustomizationsTable"
        className="Kustomizations"
        store={kustomizationStore}
        sortingCallbacks={{
          [sortBy.name]: (kustomization: Kustomization) => kustomization.getName(),
          [sortBy.namespace]: (kustomization: Kustomization) => kustomization.getNs(),
          [sortBy.ready]: (kustomization: Kustomization) => getStatusText(kustomization),
          [sortBy.status]: (kustomization: Kustomization) => getStatusMessage(kustomization),
          [sortBy.age]: (kustomization: Kustomization) => kustomization.getCreationTimestamp(),
        }}
        searchFilters={[(kustomization: Kustomization) => kustomization.getSearchFields()]}
        renderHeaderTitle="Kustomizations"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(kustomization: Kustomization) => [
          kustomization.getName(),
          kustomization.getNs(),
          this.renderStatus(kustomization),
          getStatusMessage(kustomization),
          <KubeAge timestamp={kustomization.getCreationTimestamp()} key="age" />,
        ]}
      />
    );
  }

  renderStatus(kustomization: Kustomization) {
    const className = getStatusClass(kustomization);
    const text = getStatusText(kustomization);
    return <Badge key="name" label={text} className={className} />;
  }
}
