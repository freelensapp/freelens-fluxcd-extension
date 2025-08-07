import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { GitRepository, type GitRepositoryApi } from "../../../k8s/fluxcd/source/gitrepository";
import { getHeight, getMaybeDetailsUrl } from "../../../utils";
import { StatusArtifact } from "../../status-artifact";
import { getConditionClass, getConditionText, StatusConditions } from "../../status-conditions";
import styles from "./git-repository-details.module.scss";
import stylesInline from "./git-repository-details.module.scss?inline";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, BadgeBoolean, DrawerItem, DrawerTitle, Icon, MaybeLink, MonacoEditor },
  K8sApi: { secretsApi },
} = Renderer;

export const GitRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<GitRepository>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();
    const api = GitRepository.getApi() as GitRepositoryApi;

    const gitRefFull = GitRepository.getGitRefFull(object.spec.ref);
    const gitRevision = GitRepository.getGitRevision(object);

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          <DrawerItem name="Condition">
            <Badge className={getConditionClass(object)} label={getConditionText(object)} />
          </DrawerItem>
          <DrawerItem name="Suspended">
            <BadgeBoolean value={object.spec.suspend ?? false} />
          </DrawerItem>
          <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
          <DrawerItem name="Timeout">{object.spec.timeout}</DrawerItem>
          <DrawerItem name="Git Ref" hidden={!gitRefFull}>
            {gitRefFull}
          </DrawerItem>
          <DrawerItem name="Revision" hidden={!gitRevision}>
            {gitRevision}
          </DrawerItem>
          <DrawerItem name="Git Credentials" hidden={!object.spec.secretRef}>
            <MaybeLink
              key="link"
              to={getMaybeDetailsUrl(
                secretsApi.formatUrlForNotListing({ name: object.spec.secretRef?.name, namespace }),
              )}
              onClick={stopPropagation}
            >
              {object.spec.secretRef?.name}
            </MaybeLink>
          </DrawerItem>
          <DrawerItem name="Verify OpenPGP signature" hidden={!object.spec.verify}>
            {object.spec.verify?.mode ?? "unknown"}
            {": "}
            <MaybeLink
              key="link"
              to={getMaybeDetailsUrl(
                secretsApi.formatUrlForNotListing({ name: object.spec.verify?.secretRef?.name, namespace }),
              )}
              onClick={stopPropagation}
            >
              {object.spec.verify?.secretRef?.name}
            </MaybeLink>
          </DrawerItem>
          <DrawerItem name="Source Ignore" hidden={!object.spec.ignore}>
            <MonacoEditor
              readOnly
              id="ignore"
              className={styles.editor}
              style={{
                minHeight: getHeight(object.spec.ignore ?? ""),
              }}
              value={object.spec.ignore ?? ""}
              setInitialHeight
              options={{
                scrollbar: {
                  alwaysConsumeMouseWheel: false,
                },
              }}
            />
          </DrawerItem>
          <DrawerItem name="Git Implementation">{object.spec.gitImplementation ?? "go-git"}</DrawerItem>
          <DrawerItem
            name="Recurse Submodules"
            hidden={object.spec.gitImplementation && object.spec.gitImplementation !== "go-git"}
          >
            <BadgeBoolean value={object.spec.recurseSubmodules ?? false} />
          </DrawerItem>

          {object.spec.include && (
            <div>
              <DrawerTitle>Include Repositories</DrawerTitle>
              {object.spec.include.map((include) => {
                const name = include.repository.name;
                return (
                  <div key={name}>
                    <div className={styles.title}>
                      <Icon small material="list" />
                    </div>
                    <DrawerItem name="Git Repository">
                      <MaybeLink
                        key="link"
                        to={getMaybeDetailsUrl(api.formatUrlForNotListing({ name, namespace }))}
                        onClick={stopPropagation}
                      >
                        {name}
                      </MaybeLink>
                    </DrawerItem>
                    <DrawerItem name="From Path">{include.fromPath}</DrawerItem>
                    <DrawerItem name="To Path">{include.toPath}</DrawerItem>
                  </div>
                );
              })}
            </div>
          )}

          {object.spec.accessFrom && (
            <DrawerItem name="Access From">
              {object.spec.accessFrom?.namespaceSelectors.map((namespaceSelector) => (
                <div key={namespaceSelector.matchLabels?.toString()}>
                  <div>Match Labels:</div>
                  <div className={styles.matchLabels}>
                    {Object.entries(namespaceSelector.matchLabels ?? {}).map(([key, value], index) => (
                      <Badge label={`${key}=${value ?? ""}`} key={index} />
                    ))}
                  </div>
                </div>
              ))}
            </DrawerItem>
          )}

          <StatusArtifact object={object} />

          <StatusConditions object={object} />
        </div>
      </>
    );
  },
);
