import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { getConditionClass, getConditionText, getStatusMessage } from "../../components/status-conditions";
import { Alert } from "../../k8s/fluxcd/notification/alert";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout },
} = Renderer;

enum sortBy {
  name = "name",
  namespace = "namespace",
  status = "status",
  ready = "ready",
  age = "age",
}

@observer
export class AlertsPage extends React.Component {
  render() {
    const store = Alert.getStore();
    if (!store) return <></>;
    return (
      <KubeObjectListLayout
        tableId="alertsTable"
        className="Alerts"
        store={store}
        sortingCallbacks={{
          [sortBy.name]: (alert: Alert) => alert.getName(),
          [sortBy.namespace]: (alert: Alert) => alert.getNs(),
          [sortBy.ready]: (alert: Alert) => getConditionText(alert.status?.conditions),
          [sortBy.status]: (alert: Alert) => getStatusMessage(alert.status?.conditions),
          [sortBy.age]: (alert: Alert) => alert.getCreationTimestamp(),
        }}
        searchFilters={[(alert: Alert) => alert.getSearchFields()]}
        renderHeaderTitle="Alerts"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(alert: Alert) => [
          alert.getName(),
          alert.getNs(),
          this.renderStatus(alert),
          getStatusMessage(alert.status?.conditions),
          <KubeObjectAge object={alert} key="age" />,
        ]}
      />
    );
  }

  renderStatus(alert: Alert) {
    const className = getConditionClass(alert.status?.conditions);
    const text = getConditionText(alert.status?.conditions);
    return <Badge key="name" label={text} className={className} />;
  }
}
