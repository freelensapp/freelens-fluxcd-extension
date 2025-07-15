import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { Kustomization } from "../../k8s/fluxcd/kustomize/kustomization";
import { getStatusClass, getStatusMessage, getStatusText } from "../../utils";
import styles from "./kustomizations.module.scss";
import stylesInline from "./kustomizations.module.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, WithTooltip },
  K8sApi: { namespacesApi },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

export const KustomizationsPage = observer(() => {
  const store = Kustomization.getStore();
  if (!store) return <></>;

  const sortingCallbacks = {
    name: (kustomization: Kustomization) => kustomization.getName(),
    namespace: (kustomization: Kustomization) => kustomization.getNs(),
    revision: (kustomization: Kustomization) => kustomization.status?.lastAppliedRevision,
    status: (kustomization: Kustomization) => getStatusText(kustomization),
    message: (kustomization: Kustomization) => getStatusText(kustomization),
    age: (kustomization: Kustomization) => kustomization.getCreationTimestamp(),
  };

  const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
    { title: "Name", sortBy: "name" },
    { title: "Namespace", sortBy: "namespace" },
    { title: "Revision", sortBy: "revision", className: styles.revision },
    { title: "Status", sortBy: "status", className: styles.status },
    { title: "Message", sortBy: "message", className: styles.message },
    { title: "Age", sortBy: "age", className: styles.age },
  ];

  return (
    <>
      <style>{stylesInline}</style>
      <KubeObjectListLayout
        tableId="kustomizationsTable"
        className={styles.kustomizations}
        store={store}
        sortingCallbacks={sortingCallbacks}
        searchFilters={[(kustomization: Kustomization) => kustomization.getSearchFields()]}
        renderHeaderTitle="Kustomizations"
        renderTableHeader={renderTableHeader}
        renderTableContents={(kustomization: Kustomization) => {
          const lastAppliedRevision =
            kustomization.status?.lastAppliedRevision?.replace(/^refs\/(heads|tags)\//, "") || "N/A";
          const statusMessage = getStatusMessage(kustomization);

          return [
            <WithTooltip>{kustomization.getName()}</WithTooltip>,
            <Link
              key="link"
              to={getDetailsUrl(namespacesApi.formatUrlForNotListing({ name: kustomization.getNs() }))}
              onClick={stopPropagation}
            >
              <WithTooltip>{kustomization.getNs()}</WithTooltip>
            </Link>,
            <WithTooltip>{lastAppliedRevision}</WithTooltip>,
            <Badge className={getStatusClass(kustomization)} label={getStatusText(kustomization)} />,
            <WithTooltip>{statusMessage}</WithTooltip>,
            <KubeObjectAge object={kustomization} key="age" />,
          ];
        }}
      />
    </>
  );
});
