import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { ImageUpdateAutomation } from "../../k8s/fluxcd/image/imageupdateautomation";
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
export class ImageUpdateAutomationsPage extends React.Component {
  render() {
    const store = ImageUpdateAutomation.getStore();
    if (!store) return <></>;
    return (
      <KubeObjectListLayout
        tableId="imageUpdateAutomationsTable"
        className="ImageUpdateAutomations"
        store={store}
        sortingCallbacks={{
          [sortBy.name]: (imageUpdateAutomation: ImageUpdateAutomation) => imageUpdateAutomation.getName(),
          [sortBy.namespace]: (imageUpdateAutomation: ImageUpdateAutomation) => imageUpdateAutomation.getNs(),
          [sortBy.ready]: (imageUpdateAutomation: ImageUpdateAutomation) => getStatusText(imageUpdateAutomation),
          [sortBy.status]: (imageUpdateAutomation: ImageUpdateAutomation) => getStatusMessage(imageUpdateAutomation),
          [sortBy.age]: (imageUpdateAutomation: ImageUpdateAutomation) => imageUpdateAutomation.getCreationTimestamp(),
        }}
        searchFilters={[(imageUpdateAutomation: ImageUpdateAutomation) => imageUpdateAutomation.getSearchFields()]}
        renderHeaderTitle="Image Update Automations"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(imageUpdateAutomation: ImageUpdateAutomation) => [
          imageUpdateAutomation.getName(),
          imageUpdateAutomation.getNs(),
          this.renderStatus(imageUpdateAutomation),
          getStatusMessage(imageUpdateAutomation),
          <KubeObjectAge object={imageUpdateAutomation} key="age" />,
        ]}
      />
    );
  }

  renderStatus(imageUpdateAutomation: ImageUpdateAutomation) {
    const className = getStatusClass(imageUpdateAutomation);
    const text = getStatusText(imageUpdateAutomation);
    return <Badge key="name" label={text} className={className} />;
  }
}
