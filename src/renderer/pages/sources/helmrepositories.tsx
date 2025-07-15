import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { HelmRepository } from "../../k8s/fluxcd/source/helmrepository";
import { getStatusClass, getStatusMessage, getStatusText } from "../../utils";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout },
} = Renderer;

enum sortBy {
  name = "name",
  url = "url",
  namespace = "namespace",
  status = "status",
  ready = "ready",
  age = "age",
}

@observer
export class HelmRepositoriesPage extends React.Component {
  render() {
    const store = HelmRepository.getStore();
    if (!store) return <></>;
    return (
      <KubeObjectListLayout
        tableId="helmRepositoriesTable"
        className="HelmRepositories"
        store={store}
        sortingCallbacks={{
          [sortBy.name]: (helmRepository: HelmRepository) => helmRepository.getName(),
          [sortBy.namespace]: (helmRepository: HelmRepository) => helmRepository.getNs(),
          [sortBy.url]: (helmRepository: HelmRepository) => helmRepository.spec.url,
          [sortBy.ready]: (helmRepository: HelmRepository) => getStatusText(helmRepository),
          [sortBy.status]: (helmRepository: HelmRepository) => getStatusMessage(helmRepository),
          [sortBy.age]: (helmRepository: HelmRepository) => helmRepository.getCreationTimestamp(),
        }}
        searchFilters={[(helmRepository: HelmRepository) => helmRepository.getSearchFields()]}
        renderHeaderTitle="Helm Repositories"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Url", className: "url", sortBy: sortBy.url },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(helmRepository: HelmRepository) => [
          helmRepository.getName(),
          helmRepository.getNs(),
          helmRepository.spec.url,
          this.renderStatus(helmRepository),
          getStatusMessage(helmRepository),
          <KubeObjectAge object={helmRepository} key="age" />,
        ]}
      />
    );
  }

  renderStatus(helmRepository: HelmRepository) {
    const className = getStatusClass(helmRepository);
    const text = getStatusText(helmRepository);
    return <Badge key="name" label={text} className={className} />;
  }
}
