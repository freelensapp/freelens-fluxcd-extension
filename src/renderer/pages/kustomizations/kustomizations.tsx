import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { Link } from "react-router-dom";
import { Kustomization, kustomizationStore } from "../../k8s/fluxcd/kustomization";
import { getStatusClass, getStatusMessage, getStatusText } from "../../utils";

import styleInline from "./kustomizations.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, Tooltip },
  K8sApi: { namespacesApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

enum sortBy {
  name = "name",
  namespace = "namespace",
  revision = "revision",
  status = "status",
  message = "message",
  age = "age",
}

@observer
export class FluxCDKustomizations extends React.Component<{ extension: Renderer.LensExtension }> {
  render() {
    return (
      <>
        <style>{styleInline}</style>
        <KubeObjectListLayout
          tableId="kustomizationsTable"
          className="Kustomizations"
          store={kustomizationStore}
          sortingCallbacks={{
            [sortBy.name]: (kustomization: Kustomization) => kustomization.getName(),
            [sortBy.namespace]: (kustomization: Kustomization) => kustomization.getNs(),
            [sortBy.revision]: (kustomization: Kustomization) => kustomization.status?.lastAppliedRevision,
            [sortBy.status]: (kustomization: Kustomization) => getStatusText(kustomization),
            [sortBy.message]: (kustomization: Kustomization) => getStatusText(kustomization),
            [sortBy.age]: (kustomization: Kustomization) => kustomization.getCreationTimestamp(),
          }}
          searchFilters={[(kustomization: Kustomization) => kustomization.getSearchFields()]}
          renderHeaderTitle="Kustomizations"
          renderTableHeader={[
            { title: "Name", className: "name", sortBy: sortBy.name },
            { title: "Namespace", className: "namespace", sortBy: sortBy.namespace },
            { title: "Revision", className: "revision", sortBy: sortBy.revision },
            { title: "Status", className: "status", sortBy: sortBy.status },
            { title: "Message", className: "message", sortBy: sortBy.message },
            { title: "Age", className: "age", sortBy: sortBy.age },
          ]}
          renderTableContents={(kustomization: Kustomization) => {
            const tooltipId = `kustomization-${kustomization.getId()}`;
            const lastAppliedRevision =
              kustomization.status?.lastAppliedRevision?.replace(/^refs\/(heads|tags)\//, "") || "N/A";
            const statusMessage = getStatusMessage(kustomization);

            return [
              <>
                <span id={`${tooltipId}-name`}>{kustomization.getName()}</span>
                <Tooltip targetId={`${tooltipId}-name`}>{kustomization.getName()}</Tooltip>
              </>,
              <>
                <span id={`${tooltipId}-namespace`}>
                  <Link
                    key="link"
                    to={getDetailsUrl(namespacesApi.formatUrlForNotListing({ name: kustomization.getNs() }))}
                    onClick={stopPropagation}
                  >
                    {kustomization.getNs()}
                  </Link>
                </span>
                <Tooltip targetId={`${tooltipId}-namespace`}>{kustomization.getNs()}</Tooltip>
              </>,
              <>
                <span id={`${tooltipId}-lastAppliedRevision`}>{lastAppliedRevision}</span>
                <Tooltip targetId={`${tooltipId}-lastAppliedRevision`}>{lastAppliedRevision}</Tooltip>
              </>,
              <Badge className={getStatusClass(kustomization)} label={getStatusText(kustomization)} />,
              <>
                <span id={`${tooltipId}-statusMessage`}>{statusMessage}</span>
                <Tooltip targetId={`${tooltipId}-statusMessage`}>{statusMessage}</Tooltip>
              </>,
              <KubeObjectAge object={kustomization} key="age" />,
            ];
          }}
        />
      </>
    );
  }

  renderStatus(kustomization: Kustomization) {
    const className = getStatusClass(kustomization);
    const text = getStatusText(kustomization);
    return <Badge key="name" label={text} className={className} />;
  }
}
