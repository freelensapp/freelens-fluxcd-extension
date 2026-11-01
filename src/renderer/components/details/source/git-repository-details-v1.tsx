import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { GitRepository } from "../../../k8s/fluxcd/source/gitrepository-v1";
import { withFluxKind } from "../../../k8s/fluxcd/utils";
import { getHeight } from "../../../utils";
import { StatusArtifact } from "../../status-artifact";
import styles from "./git-repository-details.module.scss";

const { observer } = MobxReact;

const {
  Component: {
    BadgeBoolean,
    DrawerItem,
    DrawerTitle,
    Icon,
    LinkToObject,
    LinkToSecret,
    LinkToServiceAccount,
    MonacoEditor,
  },
} = Renderer;

export const GitRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<GitRepository>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();

    const gitRefFull = GitRepository.getGitRefFull(object.spec.ref);
    const gitRevision = GitRepository.getGitRevision(object);

    return (
      <>
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
          <DrawerItem name="Authentication Provider">{object.spec.provider ?? "generic"}</DrawerItem>
          <DrawerItem name="Git Credentials" hidden={!object.spec.secretRef}>
            <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Service Account" hidden={!object.spec.serviceAccountName}>
            <LinkToServiceAccount name={object.spec.serviceAccountName} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Proxy Configuration" hidden={!object.spec.proxySecretRef}>
            <LinkToSecret name={object.spec.proxySecretRef?.name} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Verify Commit Signature" hidden={!object.spec.verify}>
            {object.spec.verify?.mode ?? "HEAD"}
            {": "}
            <LinkToSecret name={object.spec.verify?.secretRef.name} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Source Verification Mode" hidden={!object.status?.sourceVerificationMode}>
            {object.status?.sourceVerificationMode}
          </DrawerItem>
          <DrawerItem name="Source Verification Fingerprint" hidden={!object.status?.sourceVerificationFingerprint}>
            {object.status?.sourceVerificationFingerprint}
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
          <DrawerItem name="Recurse Submodules">
            <BadgeBoolean value={object.spec.recurseSubmodules ?? false} />
          </DrawerItem>
          <DrawerItem name="Sparse Checkout" hidden={!object.spec.sparseCheckout?.length}>
            {object.spec.sparseCheckout?.map((directory) => (
              <div key={directory}>{directory}</div>
            ))}
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
                      <LinkToObject objectRef={withFluxKind(include.repository, GitRepository.kind)} object={object} />
                    </DrawerItem>
                    <DrawerItem name="From Path" hidden={!include.fromPath}>
                      {include.fromPath}
                    </DrawerItem>
                    <DrawerItem name="To Path" hidden={!include.toPath}>
                      {include.toPath}
                    </DrawerItem>
                  </div>
                );
              })}
            </div>
          )}

          <StatusArtifact artifact={object.status?.artifact} />
        </div>
      </>
    );
  },
);
