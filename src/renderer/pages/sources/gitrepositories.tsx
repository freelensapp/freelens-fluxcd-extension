import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { getGitRef, getGitRevision } from "../../components/details/sources/git-repository-details";
import { withErrorPage } from "../../components/error-page";
import { GitRepository, type GitRepositoryApi } from "../../k8s/fluxcd/source/gitrepository";
import { getConditionClass, getConditionMessage, getConditionText } from "../../utils";
import styles from "./gitrepositories.module.scss";
import stylesInline from "./gitrepositories.module.scss?inline";

const {
  Component: { Badge, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

const KubeObject = GitRepository;
type KubeObject = GitRepository;
type KubeObjectApi = GitRepositoryApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  url: (object: KubeObject) => object.spec.url,
  ref: (object: KubeObject) => getGitRef(object.spec.ref),
  revision: (object: KubeObject) => getGitRevision(object),
  condition: (object: KubeObject) => getConditionText(object),
  message: (object: KubeObject) => getConditionText(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "URL", sortBy: "url", className: styles.url },
  { title: "Target Ref", sortBy: "ref", className: styles.ref },
  { title: "Revision", sortBy: "revision", className: styles.revision },
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
          renderHeaderTitle="Git Repositories"
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => [
            <WithTooltip>{object.getName()}</WithTooltip>,
            <WithTooltip>{object.getNs()}</WithTooltip>,
            <WithTooltip>{object.spec.url}</WithTooltip>,
            <WithTooltip>{getGitRef(object.spec.ref) || "N/A"}</WithTooltip>,
            <WithTooltip>{getGitRevision(object) || "N/A"}</WithTooltip>,
            <Badge className={getConditionClass(object)} label={getConditionText(object)} />,
            <WithTooltip>{getConditionMessage(object)}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
