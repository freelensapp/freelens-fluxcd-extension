import { Renderer } from "@freelensapp/extensions";

import { observer } from "mobx-react";

import React from "react";

import { Alert, alertStore } from "../../k8s/fluxcd/notifications/alert";
import { getStatusClass, getStatusMessage, getStatusText } from "../../utils";

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
export class FluxCDAlerts extends React.Component<{ extension: Renderer.LensExtension }> {
  render() {
    return (
      <KubeObjectListLayout
        tableId="alertsTable"
        className="Alerts"
        store={alertStore}
        sortingCallbacks={{
          [sortBy.name]: (alert: Alert) => alert.getName(),
          [sortBy.namespace]: (alert: Alert) => alert.getNs(),
          [sortBy.ready]: (alert: Alert) => getStatusText(alert),
          [sortBy.status]: (alert: Alert) => getStatusMessage(alert),
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
          getStatusMessage(alert),
          <KubeObjectAge object={alert} key="age" />,
        ]}
      />
    );
  }

  renderStatus(alert: Alert) {
    const className = getStatusClass(alert);
    const text = getStatusText(alert);
    return <Badge key="name" label={text} className={className} />;
  }
}
