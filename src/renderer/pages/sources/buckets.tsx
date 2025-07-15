import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { Bucket } from "../../k8s/fluxcd/source/bucket";
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
export class BucketsPage extends React.Component {
  render() {
    const store = Bucket.getStore();
    if (!store) return <></>;
    return (
      <KubeObjectListLayout
        tableId="bucketsTable"
        className="Buckets"
        store={store}
        sortingCallbacks={{
          [sortBy.name]: (bucket: Bucket) => bucket.getName(),
          [sortBy.namespace]: (bucket: Bucket) => bucket.getNs(),
          [sortBy.url]: (bucket: Bucket) => bucket.spec.url,
          [sortBy.ready]: (bucket: Bucket) => getStatusText(bucket),
          [sortBy.status]: (bucket: Bucket) => getStatusMessage(bucket),
          [sortBy.age]: (bucket: Bucket) => bucket.getCreationTimestamp(),
        }}
        searchFilters={[(bucket: Bucket) => bucket.getSearchFields()]}
        renderHeaderTitle="Buckets"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: sortBy.name },
          { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
          { title: "Url", className: "url", sortBy: sortBy.url },
          { title: "Ready", className: "ready", sortBy: sortBy.ready },
          { title: "Status", className: "status", sortBy: sortBy.status },
          { title: "Age", className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(bucket: Bucket) => [
          bucket.getName(),
          bucket.getNs(),
          bucket.spec.url,
          this.renderStatus(bucket),
          getStatusMessage(bucket),
          <KubeObjectAge object={bucket} key="age" />,
        ]}
      />
    );
  }

  renderStatus(bucket: Bucket) {
    const className = getStatusClass(bucket);
    const text = getStatusText(bucket);
    return <Badge key="name" label={text} className={className} />;
  }
}
