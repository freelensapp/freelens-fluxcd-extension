import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { getConditionClass, getConditionMessage, getConditionText } from "../../components/status-conditions";
import { Provider } from "../../k8s/fluxcd/notification/provider";

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
export class ProvidersPage extends React.Component {
  render() {
    const store = Provider.getStore();
    if (!store) return <></>;
    return (
      <KubeObjectListLayout
        tableId="providersTable"
        className="Providers"
        store={store}
        sortingCallbacks={{
          [sortBy.name]: (provider: Provider) => provider.getName(),
          [sortBy.namespace]: (provider: Provider) => provider.getNs(),
          [sortBy.type]: (provider: Provider) => provider.spec.type,
          [sortBy.ready]: (provider: Provider) => getConditionText(provider.status?.conditions),
          [sortBy.status]: (provider: Provider) => getConditionMessage(provider.status?.conditions),
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
          getConditionMessage(provider.status?.conditions),
          <KubeObjectAge object={provider} key="age" />,
        ]}
      />
    );
  }

  renderStatus(provider: Provider) {
    const className = getConditionClass(provider.status?.conditions);
    const text = getConditionText(provider.status?.conditions);
    return <Badge key="name" label={text} className={className} />;
  }
}
