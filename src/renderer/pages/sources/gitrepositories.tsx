import { Renderer } from "@freelensapp/extensions";

import { observer } from "mobx-react";

import React from "react";

import { KubeAge } from "../../components/ui/kube-age";
import { GitRepository, gitRepositoryStore } from "../../k8s/fluxcd/sources/gitrepository";
import { getStatusClass, getStatusMessage, getStatusText } from "../../utils";

const {
  Component: { KubeObjectListLayout, Badge },
} = Renderer;

enum sortBy {
  name = "name",
  namespace = "namespace",
  status = "status",
  url = "url",
  ready = "ready",
  age = "age",
}

@observer
export class FluxCDGitRepositories extends React.Component<{ extension: Renderer.LensExtension }> {
  render() {
    return (
      <KubeObjectListLayout
        tableId="gitRepositorysTable"
        className="GitRepositories"
        store={gitRepositoryStore}
        sortingCallbacks={{
          [sortBy.name]: (gitRepository: GitRepository) => gitRepository.getName(),
          [sortBy.namespace]: (gitRepository: GitRepository) => gitRepository.getNs(),
          [sortBy.ready]: (gitRepository: GitRepository) => getStatusText(gitRepository),
          [sortBy.url]: (gitRepository: GitRepository) => gitRepository.spec.url,
          [sortBy.status]: (gitRepository: GitRepository) => getStatusMessage(gitRepository),
          [sortBy.age]: (gitRepository: GitRepository) => gitRepository.getCreationTimestamp(),
        }}
        searchFilters={[(gitRepository: GitRepository) => gitRepository.getSearchFields()]}
        renderHeaderTitle="Git Repositories"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Url", className: "url", sortBy: sortBy.url },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(gitRepository: GitRepository) => [
          gitRepository.getName(),
          gitRepository.getNs(),
          this.renderStatus(gitRepository),
          gitRepository.spec.url,
          getStatusMessage(gitRepository),
          <KubeAge timestamp={gitRepository.getCreationTimestamp()} key="age" />,
        ]}
      />
    );
  }

  renderStatus(gitRepository: GitRepository) {
    const className = getStatusClass(gitRepository);
    const text = getStatusText(gitRepository);
    return <Badge key="name" label={text} className={className} />;
  }
}
