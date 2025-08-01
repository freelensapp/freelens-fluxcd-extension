import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { Receiver } from "../../k8s/fluxcd/notification/receiver";
import { getConditionClass, getConditionMessage, getConditionText } from "../../utils";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout },
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
export class ReceiversPage extends React.Component {
  render() {
    const store = Receiver.getStore();
    if (!store) return <></>;
    return (
      <KubeObjectListLayout
        tableId="receiversTable"
        className="Receivers"
        store={store}
        sortingCallbacks={{
          [sortBy.name]: (receiver: Receiver) => receiver.getName(),
          [sortBy.namespace]: (receiver: Receiver) => receiver.getNs(),
          [sortBy.type]: (receiver: Receiver) => receiver.spec.type,
          [sortBy.ready]: (receiver: Receiver) => getConditionText(receiver),
          [sortBy.status]: (receiver: Receiver) => getConditionMessage(receiver),
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
          getConditionMessage(receiver),
          <KubeObjectAge object={receiver} key="age" />,
        ]}
      />
    );
  }

  renderStatus(receiver: Receiver) {
    const className = getConditionClass(receiver);
    const text = getConditionText(receiver);
    return <Badge key="name" label={text} className={className} />;
  }
}
