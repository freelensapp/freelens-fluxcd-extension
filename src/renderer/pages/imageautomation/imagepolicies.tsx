import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { ImagePolicy } from "../../k8s/fluxcd/image/imagepolicy";
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
  repo = "repo",
}

@observer
export class ImagePoliciesPage extends React.Component {
  render() {
    const store = ImagePolicy.getStore();
    if (!store) return <></>;
    return (
      <KubeObjectListLayout
        tableId="imagePoliciesTable"
        className="ImagePolicies"
        store={store}
        sortingCallbacks={{
          [sortBy.name]: (imagePolicy: ImagePolicy) => imagePolicy.getName(),
          [sortBy.namespace]: (imagePolicy: ImagePolicy) => imagePolicy.getNs(),
          [sortBy.repo]: (imagePolicy: ImagePolicy) => imagePolicy.spec.imageRepositoryRef.name,
          [sortBy.ready]: (imagePolicy: ImagePolicy) => getStatusText(imagePolicy),
          [sortBy.status]: (imagePolicy: ImagePolicy) => getStatusMessage(imagePolicy),
          [sortBy.age]: (imagePolicy: ImagePolicy) => imagePolicy.getCreationTimestamp(),
        }}
        searchFilters={[(imagePolicy: ImagePolicy) => imagePolicy.getSearchFields()]}
        renderHeaderTitle="Image Policies"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Image Repository", className: "image", sortBy: sortBy.repo },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(imagePolicy: ImagePolicy) => [
          imagePolicy.getName(),
          imagePolicy.getNs(),
          imagePolicy.spec.imageRepositoryRef.name,
          this.renderStatus(imagePolicy),
          getStatusMessage(imagePolicy),
          <KubeObjectAge object={imagePolicy} key="age" />,
        ]}
      />
    );
  }

  renderStatus(imagePolicy: ImagePolicy) {
    const className = getStatusClass(imagePolicy);
    const text = getStatusText(imagePolicy);
    return <Badge key="name" label={text} className={className} />;
  }
}
