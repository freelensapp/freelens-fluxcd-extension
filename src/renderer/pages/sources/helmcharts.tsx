import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { HelmChart } from "../../k8s/fluxcd/source/helmchart";
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
  chart = "chart",
}

@observer
export class HelmChartsPage extends React.Component {
  render() {
    const store = HelmChart.getStore();
    if (!store) return <></>;
    return (
      <KubeObjectListLayout
        tableId="helmRepositoriesTable"
        className="HelmCharts"
        store={store}
        sortingCallbacks={{
          [sortBy.name]: (helmChart: HelmChart) => helmChart.getName(),
          [sortBy.namespace]: (helmChart: HelmChart) => helmChart.getNs(),
          [sortBy.ready]: (helmChart: HelmChart) => getConditionText(helmChart),
          [sortBy.chart]: (helmChart: HelmChart) => helmChart.spec.chart,
          [sortBy.status]: (helmChart: HelmChart) => getConditionMessage(helmChart),
          [sortBy.age]: (helmChart: HelmChart) => helmChart.getCreationTimestamp(),
        }}
        searchFilters={[(helmChart: HelmChart) => helmChart.getSearchFields()]}
        renderHeaderTitle="Helm Charts"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Chart", className: "chart", sortBy: sortBy.chart },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(helmChart: HelmChart) => [
          helmChart.getName(),
          helmChart.getNs(),
          this.renderStatus(helmChart),
          helmChart.spec.chart,
          getConditionMessage(helmChart),
          <KubeObjectAge object={helmChart} key="age" />,
        ]}
      />
    );
  }

  renderStatus(helmChart: HelmChart) {
    const className = getConditionClass(helmChart);
    const text = getConditionText(helmChart);
    return <Badge key="name" label={text} className={className} />;
  }
}
