import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { getConditionClass, getConditionMessage, getConditionText } from "../../components/status-conditions";
import { GitRepository, type GitRepositoryApi } from "../../k8s/fluxcd/source/gitrepository";
import styles from "./gitrepositories.module.scss";
import stylesInline from "./gitrepositories.module.scss?inline";

const {
  Component: { Badge, BadgeBoolean, KubeObjectAge, KubeObjectListLayout, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = GitRepository;
type KubeObject = GitRepository;
type KubeObjectApi = GitRepositoryApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  url: (object: KubeObject) => object.spec.url,
  ref: (object: KubeObject) => GitRepository.getGitRef(object.spec.ref),
  revision: (object: KubeObject) => GitRepository.getGitRevision(object),
  resumed: (object: KubeObject) => String(!object.spec.suspend),
  condition: (object: KubeObject) => getConditionText(object.status?.conditions),
  message: (object: KubeObject) => getConditionText(object.status?.conditions),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "URL", sortBy: "url", className: styles.url },
  { title: "Target Ref", sortBy: "ref", className: styles.ref },
  { title: "Revision", sortBy: "revision", className: styles.revision },
  { title: "Resumed", sortBy: "resumed", className: styles.resumed },
  { title: "Condition", sortBy: "condition", className: styles.condition },
  { title: "Message", sortBy: "message", className: styles.message },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface GitRepositoriesPageProps {
  extension: Renderer.LensExtension;
}

export const GitRepositoriesPage = observer((props: GitRepositoriesPageProps) =>
  withErrorPage(props, () => {
    const store = KubeObject.getStore<KubeObject>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => [
            <WithTooltip>{object.getName()}</WithTooltip>,
            <NamespaceSelectBadge key="namespace" namespace={object.getNs() ?? ""} />,
            <WithTooltip>{object.spec.url}</WithTooltip>,
            <WithTooltip>{GitRepository.getGitRef(object.spec.ref) || "N/A"}</WithTooltip>,
            <WithTooltip>{GitRepository.getGitRevision(object) || "N/A"}</WithTooltip>,
            <BadgeBoolean value={!object.spec.suspend} />,
            <Badge
              className={getConditionClass(object.status?.conditions)}
              label={getConditionText(object.status?.conditions)}
            />,
            <WithTooltip>{getConditionMessage(object.status?.conditions)}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
