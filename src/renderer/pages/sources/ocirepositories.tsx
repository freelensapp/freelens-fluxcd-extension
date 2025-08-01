import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { OCIRepository } from "../../k8s/fluxcd/source/ocirepository";
import { getConditionClass, getConditionMessage, getConditionText } from "../../utils";

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
export class OCIRepositoriesPage extends React.Component {
  render() {
    const store = OCIRepository.getStore();
    if (!store) return <></>;
    return (
      <KubeObjectListLayout
        tableId="ociRepositoriesTable"
        className="OCIRepositories"
        store={store}
        sortingCallbacks={{
          [sortBy.name]: (ociRepository: OCIRepository) => ociRepository.getName(),
          [sortBy.namespace]: (ociRepository: OCIRepository) => ociRepository.getNs(),
          [sortBy.url]: (ociRepository: OCIRepository) => ociRepository.spec.url,
          [sortBy.ready]: (ociRepository: OCIRepository) => getConditionText(ociRepository),
          [sortBy.status]: (ociRepository: OCIRepository) => getConditionMessage(ociRepository),
          [sortBy.age]: (ociRepository: OCIRepository) => ociRepository.getCreationTimestamp(),
        }}
        searchFilters={[(ociRepository: OCIRepository) => ociRepository.getSearchFields()]}
        renderHeaderTitle="OCI Repositories"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Url", className: "url", sortBy: sortBy.url },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(ociRepository: OCIRepository) => [
          ociRepository.getName(),
          ociRepository.getNs(),
          ociRepository.spec.url,
          this.renderStatus(ociRepository),
          getConditionMessage(ociRepository),
          <KubeObjectAge object={ociRepository} key="age" />,
        ]}
      />
    );
  }

  renderStatus(ociRepository: OCIRepository) {
    const className = getConditionClass(ociRepository);
    const text = getConditionText(ociRepository);
    return <Badge key="name" label={text} className={className} />;
  }
}
