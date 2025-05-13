import { Renderer } from "@freelensapp/extensions";

import { observer } from "mobx-react";

import React from "react";

import { KubeAge } from "../../components/ui/kube-age";
import { Receiver, receiverStore } from "../../k8s/fluxcd/notifications/receiver";
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
export class FluxCDReceivers extends React.Component<{ extension: Renderer.LensExtension }> {
  render() {
    return (
      <KubeObjectListLayout
        tableId="receiversTable"
        className="Receivers"
        store={receiverStore}
        sortingCallbacks={{
          [sortBy.name]: (receiver: Receiver) => receiver.getName(),
          [sortBy.namespace]: (receiver: Receiver) => receiver.getNs(),
          [sortBy.type]: (receiver: Receiver) => receiver.spec.type,
          [sortBy.ready]: (receiver: Receiver) => getStatusText(receiver),
          [sortBy.status]: (receiver: Receiver) => getStatusMessage(receiver),
          [sortBy.age]: (receiver: Receiver) => receiver.getCreationTimestamp(),
        }}
        searchFilters={[(receiver: Receiver) => [...receiver.getSearchFields(), receiver.status?.webhookPath]]}
        renderHeaderTitle="Receiver"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Type", className: "type", sortBy: sortBy.type },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(receiver: Receiver) => [
          receiver.getName(),
          receiver.getNs(),
          receiver.spec.type,
          this.renderStatus(receiver),
          getStatusMessage(receiver),
          <KubeAge timestamp={receiver.getCreationTimestamp()} key="age" />,
        ]}
      />
    );
  }

  renderStatus(receiver: Receiver) {
    const className = getStatusClass(receiver);
    const text = getStatusText(receiver);
    return <Badge key="name" label={text} className={className} />;
  }
}
