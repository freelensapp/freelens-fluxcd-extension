import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { OCIRepository } from "../../../k8s/fluxcd/source/ocirepository-v1";
import { getHeight } from "../../../utils";
import { BadgeSuspended } from "../../badge-suspended";
import { StatusArtifact } from "../../status-artifact";
import styles from "./oci-repository-details.module.scss";

const { observer } = MobxReact;

const {
  Component: {
    BadgeBoolean,
    DrawerItem,
    DrawerTitle,
    DurationAbsoluteTimestamp,
    LinkToSecret,
    LinkToServiceAccount,
    MonacoEditor,
  },
} = Renderer;

export const OCIRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<OCIRepository>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();

    return (
      <div>
        <DrawerItem name="Suspended">
          <BadgeSuspended value={object.spec.suspend ?? false} />
        </DrawerItem>
        <DrawerItem name="Last Handled Reconcile At" hidden={!object.status?.lastHandledReconcileAt}>
          <DurationAbsoluteTimestamp timestamp={object.status?.lastHandledReconcileAt} />
        </DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        <DrawerItem name="Timeout">{object.spec.timeout ?? "60s"}</DrawerItem>
        <DrawerItem name="URL">{object.spec.url}</DrawerItem>
        <DrawerItem name="Authentication Provider">{object.spec.provider ?? "generic"}</DrawerItem>
        <DrawerItem name="Registry Login Credentials" hidden={!object.spec.secretRef}>
          <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
        </DrawerItem>
        <DrawerItem name="Image Pull Service Account" hidden={!object.spec.serviceAccountName}>
          <LinkToServiceAccount name={object.spec.serviceAccountName} namespace={namespace} />
        </DrawerItem>
        <DrawerItem name="TLS Certificate" hidden={!object.spec.certSecretRef}>
          <LinkToSecret name={object.spec.certSecretRef?.name} namespace={namespace} />
        </DrawerItem>
        <DrawerItem name="Proxy Configuration" hidden={!object.spec.proxySecretRef}>
          <LinkToSecret name={object.spec.proxySecretRef?.name} namespace={namespace} />
        </DrawerItem>
        <DrawerItem name="Insecure Container Registry" hidden={object.spec.insecure === undefined}>
          <BadgeBoolean value={object.spec.insecure} />
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
        <DrawerItem name="Observed Source Ignore" hidden={!object.status?.observedIgnore}>
          <MonacoEditor
            readOnly
            id="observedIgnore"
            className={styles.editor}
            style={{
              minHeight: getHeight(object.status?.observedIgnore ?? ""),
            }}
            value={object.status?.observedIgnore ?? ""}
            setInitialHeight
            options={{
              scrollbar: {
                alwaysConsumeMouseWheel: false,
              },
            }}
          />
        </DrawerItem>

        {object.spec.ref && (
          <div>
            <DrawerTitle>OCI Reference</DrawerTitle>
            <DrawerItem name="Digest" hidden={!object.spec.ref.digest}>
              {object.spec.ref.digest}
            </DrawerItem>
            <DrawerItem name="SemVer" hidden={!object.spec.ref.semver}>
              {object.spec.ref.semver}
            </DrawerItem>
            <DrawerItem name="SemVer Filter" hidden={!object.spec.ref.semverFilter}>
              {object.spec.ref.semverFilter}
            </DrawerItem>
            <DrawerItem name="Tag" hidden={!object.spec.ref.tag}>
              {object.spec.ref.tag}
            </DrawerItem>
          </div>
        )}

        {object.spec.layerSelector && (
          <div>
            <DrawerTitle>OCI Layer Selector</DrawerTitle>
            <DrawerItem name="Media type" hidden={!object.spec.layerSelector.mediaType}>
              {object.spec.layerSelector.mediaType}
            </DrawerItem>
            <DrawerItem name="Operation">{object.spec.layerSelector.operation ?? "extract"}</DrawerItem>
          </div>
        )}

        {object.status?.observedLayerSelector && (
          <div>
            <DrawerTitle>Observed OCI Layer Selector</DrawerTitle>
            <DrawerItem name="Media type" hidden={!object.status.observedLayerSelector.mediaType}>
              {object.status.observedLayerSelector.mediaType}
            </DrawerItem>
            <DrawerItem name="Operation">{object.status.observedLayerSelector.operation ?? "extract"}</DrawerItem>
          </div>
        )}

        {object.spec.verify && (
          <div>
            <DrawerTitle>Trusted Public Keys</DrawerTitle>
            <DrawerItem name="Provider">{object.spec.verify.provider ?? "cosign"}</DrawerItem>
            <DrawerItem name="Trusted Public Keys" hidden={!object.spec.verify.secretRef}>
              <LinkToSecret name={object.spec.verify.secretRef?.name} namespace={namespace} />
            </DrawerItem>
            <DrawerItem name="Trusted Root" hidden={!object.spec.verify.trustedRootSecretRef}>
              <LinkToSecret name={object.spec.verify.trustedRootSecretRef?.name} namespace={namespace} />
            </DrawerItem>
            <DrawerItem name="Source Verification Fingerprint" hidden={!object.status?.sourceVerificationFingerprint}>
              {object.status?.sourceVerificationFingerprint}
            </DrawerItem>
            <DrawerItem name="OIDC Identity" hidden={!object.spec.verify.matchOIDCIdentity?.length}>
              {object.spec.verify.matchOIDCIdentity?.map((match) => (
                <div key={Renderer.Util.createReactKey(match)}>
                  <DrawerTitle>Match</DrawerTitle>
                  <DrawerItem name="Issuer">{match.issuer}</DrawerItem>
                  <DrawerItem name="Subject">{match.subject}</DrawerItem>
                </div>
              ))}
            </DrawerItem>
          </div>
        )}
        <DrawerItem name="Latest Artifact URL" hidden={!object.status?.url}>
          {object.status?.url}
        </DrawerItem>

        <StatusArtifact artifact={object.status?.artifact} />
      </div>
    );
  },
);
