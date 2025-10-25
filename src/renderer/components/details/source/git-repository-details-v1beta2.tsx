import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { GitRepository } from "../../../k8s/fluxcd/source/gitrepository-v1beta2";
import { getHeight } from "../../../utils";
import { LinkToObject } from "../../link-to-object";
import { LinkToSecret } from "../../link-to-secret";
import { SpecAccessFrom } from "../../spec-access-from";
import { StatusArtifact } from "../../status-artifact";
import styles from "./git-repository-details.module.scss";
import stylesInline from "./git-repository-details.module.scss?inline";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, Icon, MonacoEditor },
} = Renderer;

export const GitRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<GitRepository>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();

    const gitRefFull = GitRepository.getGitRefFull(object.spec.ref);
    const gitRevision = GitRepository.getGitRevision(object);

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          <DrawerItem name="Resumed">
            <BadgeBoolean value={!object.spec.suspend} />
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
            <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Verify OpenPGP signature" hidden={!object.spec.verify}>
            {object.spec.verify?.mode ?? "unknown"}
            {": "}
            <LinkToSecret name={object.spec.verify?.secretRef?.name} namespace={namespace} />
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
                      <LinkToObject objectRef={include.repository} object={object} />
                    </DrawerItem>
                    <DrawerItem name="From Path">{include.fromPath}</DrawerItem>
                    <DrawerItem name="To Path">{include.toPath}</DrawerItem>
                  </div>
                );
              })}
            </div>
          )}

          <SpecAccessFrom accessFrom={object.spec.accessFrom} />

          <StatusArtifact artifact={object.status?.artifact} />
        </div>
      </>
    );
  },
);
